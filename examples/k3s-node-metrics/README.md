# k3s node metrics for Home Assistant

A tiny deployment that reads the node usage from `metrics-server` (part of k3s) and publishes it
to the Home Assistant MQTT broker every 10 seconds, with MQTT discovery. You get:

| Entity | Content |
|--------|---------|
| `sensor.k3s_cpu` | cluster CPU usage in % of the allocatable cores |
| `sensor.k3s_memory` | cluster memory usage in % |
| `sensor.k3s_<node>_cpu`, `sensor.k3s_<node>_memory` | the same per node |

The state message also carries the absolute numbers (`cpu_cores`, `memory_gib` and their totals)
for template sensors. No packages are installed in the container; the script is standard-library
Python on the official `python:3.13-alpine` image.

## Install

```sh
cd examples/k3s-node-metrics
cp mqtt.env.example mqtt.env   # fill in the broker address and credentials
kubectl apply -k .
kubectl -n ha-metrics logs deploy/k3s-node-metrics -f
```

The Home Assistant MQTT integration must be set up (it is when you use the Mosquitto add-on). The
sensors appear under a device called "k3s cluster" within a few seconds.

Change `CLUSTER_NAME` in `deployment.yaml` when you run more than one cluster; it prefixes the
entity ids and the MQTT topics (`<cluster>/metrics/state`).

## Drive the panel wall with it

`../k3s-fire-stages.yaml` makes the flames on an iPIXEL wall follow `sensor.k3s_cpu`.
