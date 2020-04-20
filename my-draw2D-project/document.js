//le document à charger dans ce cas un simple objet JSON
var jsonDocument =
    [
      {
        "type": "draw2d.shape.node.Between",
        "id": "c7b17337-12c0-2940-5a95-2fc9a9d6ef3d",
        "x": 450,
        "y": 326,
        "width": 40,
        "height": 40,
        "radius": 2
      },
      {
        "type": "draw2d.shape.node.Between",
        "id": "dc7f3344-1dff-3a57-5b34-7dcdd3690d0a",
        "x": 969,
        "y": 122,
        "width": 40,
        "height": 40,
        "radius": 2
      },
      {
        "type": "draw2d.shape.node.Between",
        "id": "4cc8a626-0996-f858-7ef2-df6f32b91fd4",
        "x": 323,
        "y": 387,
        "width": 40,
        "height": 40,
        "radius": 2
      },
      {
        "type": "draw2d.shape.node.Between",
        "id": "e4717df5-a72d-8de7-f023-0b9ffbf1d07e",
        "x": 862,
        "y": 175,
        "width": 40,
        "height": 40,
        "radius": 2
      },
      {
        "type": "draw2d.Connection",
        "id": "65bfc6b7-59ca-1ca3-ae97-d8afa0e23cea",
        "source": {
          "node": "c7b17337-12c0-2940-5a95-2fc9a9d6ef3d",
          "port": "output0"
        },
        "target": {
          "node": "dc7f3344-1dff-3a57-5b34-7dcdd3690d0a",
          "port": "input0"
        },
        "router": "draw2d.layout.connection.CircuitConnectionRouter"
      },
      {
        "type": "draw2d.Connection",
        "id": "f6d92efe-1e74-9e4f-3db9-b6c451b38fe7",
        "stroke": 2,
        "color": "#00f0f0",
        "source": {
          "node": "4cc8a626-0996-f858-7ef2-df6f32b91fd4",
          "port": "output0"
        },
        "target": {
          "node": "e4717df5-a72d-8de7-f023-0b9ffbf1d07e",
          "port": "input0"
        },
        "router": "draw2d.layout.connection.CircuitConnectionRouter"
      },
      {
        "type": "draw2d.Connection",
        "id": "dd704809-d000-ff14-4563-0c6ee0fbc51d",
        "source": {
          "node": "dc7f3344-1dff-3a57-5b34-7dcdd3690d0a",
          "port": "output0"
        },
        "target": {
          "node": "4cc8a626-0996-f858-7ef2-df6f32b91fd4",
          "port": "input0"
        },
        "router": "draw2d.layout.connection.CircuitConnectionRouter"
      }
    ];