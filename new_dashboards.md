# New Dashboards

Updated dashboard source





## System services memory usage
```json
{
  "aliasColors": {},
  "datasource": "Prometheus",
  "decimals": 2,
  "editable": true,
  "grid": {},
  "gridPos": {
    "h": 7,
    "w": 24,
    "x": 0,
    "y": 82
  },
  "id": 26,
  "isNew": true,
  "legend": {
    "alignAsTable": true,
    "avg": true,
    "current": true,
    "max": false,
    "min": false,
    "rightSide": true,
    "show": true,
    "sideWidth": 200,
    "sort": "current",
    "sortDesc": true,
    "total": false,
    "values": true
  },
  "lines": true,
  "linewidth": 2,
  "links": [],
  "nullPointMode": "connected",
  "pointradius": 5,
  "renderer": "flot",
  "seriesOverrides": [],
  "steppedLine": true,
  "targets": [
    {
      "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes )/\nnode_memory_MemTotal_bytes",
      "legendFormat": "{{ systemd_service_name }}",
      "interval": "10s",
      "intervalFactor": 1,
      "metric": "container_memory_usage:sort_desc",
      "refId": "A",
      "step": 10
    }
  ],
  "thresholds": [],
  "title": "System services memory usage",
  "tooltip": {
    "msResolution": false,
    "shared": true,
    "sort": 2,
    "value_type": "cumulative"
  },
  "type": "graph",
  "xaxis": {
    "show": true,
    "mode": "time",
    "name": null,
    "values": [],
    "buckets": null
  },
  "yaxes": [
    {
      "format": "percentunit",
      "label": null,
      "logBase": 1,
      "max": null,
      "min": null,
      "show": true,
      "$$hashKey": "object:740"
    },
    {
      "format": "short",
      "label": null,
      "logBase": 1,
      "max": null,
      "min": null,
      "show": false,
      "$$hashKey": "object:741"
    }
  ],
  "options": {
    "dataLinks": []
  },
  "fieldConfig": {
    "defaults": {
      "custom": {}
    },
    "overrides": []
  },
  "yaxis": {
    "align": false,
    "alignLevel": null
  },
  "dashLength": 10,
  "spaceLength": 10,
  "timeRegions": [],
  "description": "% of memory usage per node",
  "bars": false,
  "error": false,
  "fill": 0,
  "percentage": false,
  "points": false,
  "stack": false,
  "timeFrom": null,
  "timeShift": null,
  "fillGradient": 0,
  "dashes": false,
  "hiddenSeries": false
}
```
