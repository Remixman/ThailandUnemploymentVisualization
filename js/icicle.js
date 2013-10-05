var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};

var icicle;

function init(){

  // init data
  var json = {
  	"id": "node01",
  	"name": "ผู้อยู่ในวัยทำงาน (54.51)",
  	"data": {
  		"$area": 8,
  		"$dim": 8,
  		"$color": "#001eff"
  	},
  	"children": [
  		{
  			"id": "node02",
  			"name": "ผู้อยู่ในกำลังแรงงาน (39.49)",
  			"data": {
				"$area": 3949,
				"$dim": 3949,
				"$color": "#9554ff"
			},
			"children": [
				{
					"id": "node04",
					"name": "ผู้มีงานทำ (39.03)",
					"data": {
						"$area": 3903,
						"$dim": 3903,
						"$color": "#ee6aff"
					}
				},
				{
					"id": "node05",
					"name": "ผู้ว่างงาน (0.25)",
					"data": {
						"$area": 25,
						"$dim": 25,
						"$color": "#ee6aff"
					}
				},
				{
					"id": "node06",
					"name": "กำลังแรงงานที่รอฤดูกาล (0.20)",
					"data": {
						"$area": 20,
						"$dim": 20,
						"$color": "#ee6aff"
					}
				}
			]
  		},
  		{
  			"id": "node03",
  			"name": "ผู้ไม่อยู่ในกำลังแรงงาน (15.02)",
  			"data": {
				"$area": 1502,
				"$dim": 1502,
				"$color": "#9554ff"
			},
			"children": [
				{
					"id": "node07",
					"name": "ทำงานที่บ้าน (4.48)",
					"data": {
						"$area": 448,
						"$dim": 448,
						"$color": "#ee6aff"
					}
				},
				{
					"id": "node08",
					"name": "เรียนหนังสือ (4.27)",
					"data": {
						"$area": 427,
						"$dim": 427,
						"$color": "#ee6aff"
					}
				},
				{
					"id": "node09",
					"name": "เด็ก/ชรา (4.70)",
					"data": {
						"$area": 470,
						"$dim": 470,
						"$color": "#ee6aff"
					}
				},
				{
					"id": "node10",
					"name": "อื่นๆ (1.56)",
					"data": {
						"$area": 156,
						"$dim": 156,
						"$color": "#ee6aff"
					}
				}
			]
  		}
  	]
  };

  // init Icicle
  icicle = new $jit.Icicle({
    // id of the visualization container
    injectInto: 'infovis',
    // whether to add transition animations
    animate: animate,
    // nodes offset
    offset: 1,
    // whether to add cushion type nodes
    cushion: false,
    //show only three levels at a time
    constrained: true,
    levelsToShow: 3,
    // enable tips
    Tips: {
      enable: true,
      type: 'Native',
      // add positioning offsets
      offsetX: 20,
      offsetY: 20,
      // implement the onShow method to
      // add content to the tooltip when a node
      // is hovered
      onShow: function(tip, node){
        // count children
        var count = 0;
        node.eachSubnode(function(){
          count++;
        });
        // add tooltip info
        tip.innerHTML = "<div class=\"tip-title\"><b>Name:</b> " + node.name
            + "</div><div class=\"tip-text\">" + count + " children</div>";
      }
    },
    // Add events to nodes
    Events: {
      enable: true,
      onMouseEnter: function(node) {
        //add border and replot node
        node.setData('border', '#33dddd');
        icicle.fx.plotNode(node, icicle.canvas);
        icicle.labels.plotLabel(icicle.canvas, node, icicle.controller);
      },
      onMouseLeave: function(node) {
        node.removeData('border');
        icicle.fx.plot();
      },
      onClick: function(node){
        if (node) {
          //hide tips and selections
          icicle.tips.hide();
          if(icicle.events.hovered)
            this.onMouseLeave(icicle.events.hovered);
          //perform the enter animation
          icicle.enter(node);
        }
      },
      onRightClick: function(){
        //hide tips and selections
        icicle.tips.hide();
        if(icicle.events.hovered)
          this.onMouseLeave(icicle.events.hovered);
        //perform the out animation
        icicle.out();
      }
    },
    // Add canvas label styling
    Label: {
      type: labelType // "Native" or "HTML"
    },
    // Add the name of the node in the corresponding label
    // This method is called once, on label creation and only for DOM and not
    // Native labels.
    onCreateLabel: function(domElement, node){
      domElement.innerHTML = node.name;
      var style = domElement.style;
      style.fontSize = '0.9em';
      style.display = '';
      style.cursor = 'pointer';
      style.color = '#333';
      style.overflow = 'hidden';
    },
    // Change some label dom properties.
    // This method is called each time a label is plotted.
    onPlaceLabel: function(domElement, node){
      var style = domElement.style,
          width = node.getData('width'),
          height = node.getData('height');
      if(width < 7 || height < 7) {
        style.display = 'none';
      } else {
        style.display = '';
        style.width = width + 'px';
        style.height = height + 'px';
      }
    }
  });
  
  // load data
  icicle.loadJSON(json);
  // compute positions and plot
  icicle.refresh();
  //end
}
