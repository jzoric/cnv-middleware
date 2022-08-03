apiVersion: v1
kind: Secret
metadata:
  name: arango-secret
type: Opaque
data:
  ARANGO_ROOT_PASSWORD: $ARANGO_ROOT_PASSWORD
