﻿<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<title></title>
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="viewport" content="width=device-width, minimum-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <link rel="stylesheet/less" type="text/css" href="css/styles.less" />

  <script src="./lib/jquery.js"></script>
  <script src="./lib/jquery-ui.js"></script>

  <script src="draw2d.js"></script>

  <script src="./lib/less-1.7.5.min.js" type="text/javascript"></script>
  <script src="./lib/underscore-min.js" type="text/javascript"></script>
  <script src="./lib/backbone-min.js" type="text/javascript"></script>
  
  <script type="text/javascript"></script>
  
  <script src="./app/Application.js"></script>
  <script src="./app/Canvas.js"></script>
  <script src="./app/Toolbar.js"></script>
  <script src="./app/PropertyPane.js"></script>
  <script src="./app/OpAmpBackboneView.js"></script>

  <script src="document.js"></script>

<script type="text/javascript">

var app;
document.addEventListener("DOMContentLoaded",function () {

      app  = new example.Application();

      // unmarshal the JSON document into the canvas
      // (load)
      var reader = new draw2d.io.json.Reader();
      reader.unmarshal(app.view, jsonDocument);

});

</script>

</head>


<body id="container">

   <div id="logo">Draw2D</div>
   <div id="toolbar" class="navbar-default">
   </div>

   <div id="propertyPane" >
     <div id="propertyHeader" class="highlight panetitle blackgradient">
        <!-- Shape Properties -->
     </div>
     <div id="properties">

     </div>
   </div>

   <div id="canvas" >
   </div>

</body>
</html>
