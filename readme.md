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
CATTLE_ACCESS_KEY=token-czddw
CATTLE_SECRET_KEY=9ndcw8zjcfgg8pzdd689b84gzxft8zk75zlmbl9wt2fxsgr62lpg9c
#BEARER_TOKEN=token-czddw:9ndcw8zjcfgg8pzdd689b84gzxft8zk75zlmbl9wt2fxsgr62lpg9c
```


```bash
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

rancher-scaler.config.yaml
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


## Questions:

1. How do we pass in the secrets dynamically to our cron job?