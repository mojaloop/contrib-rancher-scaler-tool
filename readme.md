# Rancher Scaler

Work in progress repo for scheduling our kube clusters to save 💲💲💲


## CronJob

```bash
# create an example cronjob
kubectl create -f ./test-cronjob.yaml

kubectl get cronjob hello
kubectl get jobs --watch

# Replace "hello-4111706356" with the job name in your system
pods=$(kubectl get pods --selector=job-name=hello-1592453640 --output=jsonpath={.items[*].metadata.name})
kubectl logs $pods
```

## Rancher API

1. create a new access token in Rancher with global scope (it needs to talk to the root rancher cluster)
```
ENDPOINT=https://k8s-tanuki-rancher.mojaloop.live/v3
```


```bash
source .env

# get the nodePool
curl -u "${CATTLE_ACCESS_KEY}:${CATTLE_SECRET_KEY}" \
-X GET \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
'https://k8s-tanuki-rancher.mojaloop.live/v3/nodePools/c-vsm2w:np-mg5wr' 

# change the number of nodes
curl -u "${CATTLE_ACCESS_KEY}:${CATTLE_SECRET_KEY}" \
-X PUT \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
'https://k8s-tanuki-rancher.mojaloop.live/v3/nodePools/c-vsm2w:np-mg5wr' \
-d '{"quantity": 2, "nodeTemplateId": "cattle-global-nt:nt-user-s7l26-nt-2s4x5"}'
```


Arguments:
- access key
- secret key
# this should be a map...
- nodePoolId
- quantity
- nodeTemplateId

rancher-scaler.config.js
```js
{
  cattleAccessKey: 'XXXX',
  cattleSecretKey: 'YYYY',
  rancherBaseUrl: 'https://k8s-tanuki-rancher.mojaloop.live/v3',
  nodes: [
    {
      nodePoolId: 'c-vsm2w:np-mg5wr',
      quantity: 2,
      nodeTemplateId: 'cattle-global-nt:nt-user-s7l26-nt-2s4x5'
    }
  ]
}
```

## Rancher Scaler tool:

```bash
# .env should take the format:
#
# export CATTLE_ACCESS_KEY=
# export CATTLE_SECRET_KEY=
#
source .env

# Scale down the node pools in ./config/rancher-scaler.config.js
npm run scale:down

# Scale up the node pools in ./config/rancher-scaler.config.js
npm run scale:up

```

## Docker commands for local testing:

```bash
# .env.docker should take the format:
#
#CATTLE_ACCESS_KEY=
#CATTLE_SECRET_KEY=
#
docker build -t mojaloop/rancher-scaler:local .



```


## Questions:

1. How do we pass in the secrets dynamically to our cron job?