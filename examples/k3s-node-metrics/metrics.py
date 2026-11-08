"""Publish k3s node CPU and memory usage to Home Assistant over MQTT.

Runs inside the cluster with a service account that may read nodes and the
metrics.k8s.io API (metrics-server ships with k3s). Every INTERVAL seconds it
publishes one retained JSON message with the cluster-wide and per-node usage,
and MQTT discovery messages so the sensors appear in Home Assistant by
themselves. Standard library only: no packages to install in the container.
"""
from __future__ import annotations

import json
import os
import socket
import ssl
import sys
import time
import urllib.request

INTERVAL = float(os.environ.get("INTERVAL", "10"))
CLUSTER = os.environ.get("CLUSTER_NAME", "k3s")
DISCOVERY_PREFIX = os.environ.get("DISCOVERY_PREFIX", "homeassistant")
MQTT_HOST = os.environ["MQTT_HOST"]
MQTT_PORT = int(os.environ.get("MQTT_PORT", "1883"))
MQTT_USER = os.environ.get("MQTT_USER", "")
MQTT_PASSWORD = os.environ.get("MQTT_PASSWORD", "")
STATE_TOPIC = f"{CLUSTER}/metrics/state"
DISCOVERY_EVERY = 60  # cycles between repeats of the discovery messages

SA_DIR = "/var/run/secrets/kubernetes.io/serviceaccount"
API = f"https://{os.environ.get('KUBERNETES_SERVICE_HOST', 'kubernetes.default.svc')}:{os.environ.get('KUBERNETES_SERVICE_PORT', '443')}"

CPU_SUFFIXES = {"n": 1e-9, "u": 1e-6, "m": 1e-3}
MEM_SUFFIXES = {
    "Ki": 1024, "Mi": 1024**2, "Gi": 1024**3, "Ti": 1024**4, "Pi": 1024**5,
    "k": 1e3, "M": 1e6, "G": 1e9, "T": 1e12, "P": 1e15,
}


def parse_cpu(value: str) -> float:
    """Return a Kubernetes CPU quantity ("250m", "1500000n", "4") in cores."""
    for suffix, factor in CPU_SUFFIXES.items():
        if value.endswith(suffix):
            return float(value[: -len(suffix)]) * factor
    return float(value)


def parse_memory(value: str) -> float:
    """Return a Kubernetes memory quantity ("16Gi", "1024Ki", "512M") in bytes."""
    for suffix, factor in MEM_SUFFIXES.items():
        if value.endswith(suffix):
            return float(value[: -len(suffix)]) * factor
    return float(value)


def k8s_get(path: str) -> dict:
    """GET a path of the Kubernetes API with the pod's service account."""
    with open(f"{SA_DIR}/token", encoding="utf-8") as handle:
        token = handle.read().strip()
    context = ssl.create_default_context(cafile=f"{SA_DIR}/ca.crt")
    request = urllib.request.Request(API + path, headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(request, timeout=10, context=context) as response:
        return json.load(response)


def collect() -> dict:
    """Return usage percentages for the cluster and every node."""
    capacity = {
        node["metadata"]["name"]: node["status"]["allocatable"]
        for node in k8s_get("/api/v1/nodes")["items"]
    }
    usage = k8s_get("/apis/metrics.k8s.io/v1beta1/nodes")["items"]
    nodes: dict[str, dict] = {}
    cpu_used = cpu_total = mem_used = mem_total = 0.0
    for item in usage:
        name = item["metadata"]["name"]
        if name not in capacity:
            continue
        cpu = parse_cpu(item["usage"]["cpu"])
        mem = parse_memory(item["usage"]["memory"])
        cpu_cap = parse_cpu(capacity[name]["cpu"])
        mem_cap = parse_memory(capacity[name]["memory"])
        nodes[name] = {
            "cpu": round(100 * cpu / cpu_cap, 1) if cpu_cap else None,
            "memory": round(100 * mem / mem_cap, 1) if mem_cap else None,
            "cpu_cores": round(cpu, 2),
            "memory_gib": round(mem / 1024**3, 2),
        }
        cpu_used += cpu
        cpu_total += cpu_cap
        mem_used += mem
        mem_total += mem_cap
    return {
        "cpu": round(100 * cpu_used / cpu_total, 1) if cpu_total else None,
        "memory": round(100 * mem_used / mem_total, 1) if mem_total else None,
        "cpu_cores": round(cpu_used, 2),
        "cpu_cores_total": round(cpu_total, 2),
        "memory_gib": round(mem_used / 1024**3, 2),
        "memory_gib_total": round(mem_total / 1024**3, 2),
        "nodes": nodes,
    }


# --- a minimal MQTT 3.1.1 publisher (QoS 0) ---------------------------------

def _mqtt_string(text: str) -> bytes:
    data = text.encode("utf-8")
    return len(data).to_bytes(2, "big") + data


def _mqtt_length(length: int) -> bytes:
    out = b""
    while True:
        digit, length = length % 128, length // 128
        out += bytes([digit | 0x80 if length else digit])
        if not length:
            return out


class Mqtt:
    """Connect, publish a few retained messages, disconnect."""

    def __init__(self) -> None:
        self._sock = socket.create_connection((MQTT_HOST, MQTT_PORT), timeout=10)
        flags = 0x02  # clean session
        payload = _mqtt_string(f"{CLUSTER}-node-metrics")
        if MQTT_USER:
            flags |= 0x80
            payload += _mqtt_string(MQTT_USER)
        if MQTT_PASSWORD:
            flags |= 0x40
            payload += _mqtt_string(MQTT_PASSWORD)
        header = _mqtt_string("MQTT") + b"\x04" + bytes([flags]) + (60).to_bytes(2, "big")
        self._sock.sendall(b"\x10" + _mqtt_length(len(header + payload)) + header + payload)
        ack = self._sock.recv(4)
        if len(ack) < 4 or ack[0] != 0x20 or ack[3] != 0:
            raise ConnectionError(f"MQTT broker refused the connection: {ack.hex()}")

    def publish(self, topic: str, payload: str, *, retain: bool = True) -> None:
        body = _mqtt_string(topic) + payload.encode("utf-8")
        self._sock.sendall(bytes([0x30 | (0x01 if retain else 0)]) + _mqtt_length(len(body)) + body)

    def close(self) -> None:
        try:
            self._sock.sendall(b"\xe0\x00")
        finally:
            self._sock.close()


def discovery_messages(nodes: list[str]) -> dict[str, dict]:
    """Return topic -> config for the Home Assistant MQTT discovery."""
    device = {
        "identifiers": [f"{CLUSTER}_node_metrics"],
        "name": f"{CLUSTER} cluster",
        "manufacturer": "k3s",
        "model": "node metrics",
    }
    common = {
        "state_topic": STATE_TOPIC,
        "device": device,
        "expire_after": int(INTERVAL * 6),
        "state_class": "measurement",
    }

    def sensor(key: str, name: str, template: str, unit: str, icon: str) -> dict:
        return {
            **common,
            "name": name,
            "unique_id": f"{CLUSTER}_{key}",
            "object_id": f"{CLUSTER}_{key}",
            "value_template": template,
            "unit_of_measurement": unit,
            "icon": icon,
        }

    messages = {
        f"{DISCOVERY_PREFIX}/sensor/{CLUSTER}_cpu/config": sensor(
            "cpu", "CPU usage", "{{ value_json.cpu }}", "%", "mdi:chip"
        ),
        f"{DISCOVERY_PREFIX}/sensor/{CLUSTER}_memory/config": sensor(
            "memory", "Memory usage", "{{ value_json.memory }}", "%", "mdi:memory"
        ),
    }
    for node in nodes:
        slug = "".join(ch if ch.isalnum() else "_" for ch in node.lower())
        messages[f"{DISCOVERY_PREFIX}/sensor/{CLUSTER}_{slug}_cpu/config"] = sensor(
            f"{slug}_cpu", f"{node} CPU usage",
            f"{{{{ value_json.nodes['{node}'].cpu }}}}", "%", "mdi:chip",
        )
        messages[f"{DISCOVERY_PREFIX}/sensor/{CLUSTER}_{slug}_memory/config"] = sensor(
            f"{slug}_memory", f"{node} memory usage",
            f"{{{{ value_json.nodes['{node}'].memory }}}}", "%", "mdi:memory",
        )
    return messages


def main() -> None:
    cycle = 0
    announced: set[str] = set()
    while True:
        started = time.monotonic()
        try:
            state = collect()
            client = Mqtt()
            try:
                nodes = sorted(state["nodes"])
                if cycle % DISCOVERY_EVERY == 0 or set(nodes) - announced:
                    for topic, config in discovery_messages(nodes).items():
                        client.publish(topic, json.dumps(config))
                    announced = set(nodes)
                client.publish(STATE_TOPIC, json.dumps(state))
            finally:
                client.close()
            print(f"cpu {state['cpu']}% memory {state['memory']}% nodes {len(state['nodes'])}", flush=True)
        except Exception as err:  # noqa: BLE001 - keep running, report, retry next cycle
            print(f"error: {err!r}", file=sys.stderr, flush=True)
        cycle += 1
        time.sleep(max(1.0, INTERVAL - (time.monotonic() - started)))


if __name__ == "__main__":
    main()
