var initLoad = true;

/* Create two variables that will hold:
1. The different types of layers available to Mapbox and their
respective opacity attributes.
2. The possible alignments which could be applied to the vignettes.*/
var layerTypes = {
  fill: ["fill-opacity"],
  line: ["line-opacity"],
  circle: ["circle-opacity", "circle-stroke-opacity"],
  symbol: ["icon-opacity", "text-opacity"],
  raster: ["raster-opacity"],
  "fill-extrusion": ["fill-extrusion-opacity"],
  heatmap: ["heatmap-opacity"],
};

var alignments = {
  left: "lefty",
  center: "centered",
  right: "righty",
  full: "fully",
};

/* The next two functions help turn on and off individual
layers through their opacity attributes: The first one gets
the type of layer and the second one adjusts the layer's opacity */
function getLayerPaintType(layer) {
  var layerType = map.getLayer(layer).type;
  return layerTypes[layerType];
}

function setLayerOpacity(layer) {
  var paintProps = getLayerPaintType(layer.layer);
  paintProps.forEach(function (prop) {
    var options = {};
    if (layer.duration) {
      var transitionProp = prop + "-transition";
      options = { duration: layer.duration };
      map.setPaintProperty(layer.layer, transitionProp, options);
    }
    map.setPaintProperty(layer.layer, prop, layer.opacity, options);
  });
}

// -----------------控制滑动------------ 就放在 setLayerOpacity 后面：

function setupImageComparisonSlide() {
  const slider = document.querySelector(".clip-slider");
  const afterImg = document.querySelector(".clip-img.after");
  if (!slider || !afterImg) return;

  slider.addEventListener("input", () => {
    const val = slider.value;
    afterImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
  });
}



/* Next, these variables and functions create the story and vignette html
elements, and populate them with the content from the config.js file.
They also assign a css class to certain elements, also based on the
config.js file */
var story = document.getElementById("story");
var features = document.createElement("div");
var header = document.createElement("div");
features.setAttribute("id", "features");

// If the content exists, then assign it to the 'header' element
// Note how each one of these are assigning 'innerHTML'
if (config.topTitle) {
  var topTitle = document.createElement("div");
  topTitle.innerHTML = config.topTitle;
  header.appendChild(topTitle);
}
if (config.title) {
  var titleText = document.createElement("div");
  titleText.innerHTML = config.title;
  header.appendChild(titleText);
}
if (config.subtitle) {
  var subtitleText = document.createElement("div");
  subtitleText.innerHTML = config.subtitle;
  header.appendChild(subtitleText);
}
if (config.byline) {
  var bylineText = document.createElement("div");
  bylineText.innerHTML = config.byline;
  header.appendChild(bylineText);
}
if (config.description) {
  var descriptionText = document.createElement("div");
  descriptionText.innerHTML = config.description;
  header.appendChild(descriptionText);
}

// If after this, the header has anything in it, it gets appended to the story
if (header.innerText.length > 0) {
  header.classList.add(config.theme);
  header.setAttribute("id", "header");
  story.appendChild(header);
}

/* After building the elements and assigning content to the header these
functions will loop through the chapters in the config.js file,
create the vignette elements and assign them their respective content */
config.chapters.forEach((record, idx) => {
  /* These first two variables will hold each vignette, the chapter
  element will go in the container element */
  var container = document.createElement("div");
  var chapter = document.createElement("div");
  // Adds a class to the vignette
  chapter.classList.add("br3");
  // Adds all the content to the vignette's div
  chapter.innerHTML = record.chapterDiv;
  // Sets the id for the vignette and adds the step css attribute
  container.setAttribute("id", record.id);
  container.classList.add("step");
  // If the chapter is the first one, set it to active
  if (idx === 0) {
    container.classList.add("active");
  }
  // Adds the overall theme to the chapter element
  chapter.classList.add(config.theme);
  /* Appends the chapter to the container element and the container
  element to the features element */
  container.appendChild(chapter);
  container.classList.add(alignments[record.alignment] || "centered");
  // 如果是 Prince Street 章节，加特殊样式
  if (record.id === "Prince00" || record.id === "Prince01" || record.id === "Prince02"|| record.id === "Prince03"|| record.id === "Prince04"|| record.id === "Prince05"|| record.id === "Prince06"|| record.id === "Prince07"|| record.id === "Prince08"|| record.id === "Prince09") {
    container.classList.add("step-dark");
  }
  
  if (record.hidden) {
    container.classList.add("hidden");
  }
  features.appendChild(container);
});
  


// Appends the features element (with the vignettes) to the story element
story.appendChild(features);

/* Next, this section creates the footer element and assigns it
its content based on the config.js file */
var footer = document.createElement("div");

if (config.footer) {
  var footerText = document.createElement("p");
  footerText.innerHTML = config.footer;
  footer.appendChild(footerText);
}

if (footer.innerText.length > 0) {
  footer.classList.add(config.theme);
  const footerContainer = document.getElementById("footer");
  if (footerContainer) {
    footerContainer.appendChild(footer);
  }
}


// Adds the Mapbox access token
mapboxgl.accessToken = config.accessToken;

/* This section creates the map element with the
attributes from the main section of the config.js file */
var map = new mapboxgl.Map({
  container: "map",/* ---底图---*/
  accessToken: 'pk.eyJ1Ijoiam9zaWUwOTIzMTAiLCJhIjoiY20xNDBuejgzMWo1bzJpcTJ1YjBjbXpncCJ9.0iHQV9BxlqBxfklfiR_lKQ',
  style: 'mapbox://styles/josie092310/cm9irnua800p801qkdoywarti',
  center: config.chapters[0].location.center,
  zoom: config.chapters[0].location.zoom,
  bearing: config.chapters[0].location.bearing,
  pitch: config.chapters[0].location.pitch,
  interactive: false,
  projection: config.projection,
});

// Create a inset map if enabled in config.js
if (config.inset) {
  map.addControl(
    new GlobeMinimap({ ...config.insetOptions }),
    config.insetPosition
  );
}

if (config.showMarkers) {
  var marker = new mapboxgl.Marker({ color: config.markerColor });
  marker.setLngLat(config.chapters[0].location.center).addTo(map);
}

// instantiate the scrollama
var scroller = scrollama();

/* Here we add the two extra layers we are using, just like in our previous
tutorial. At the end, however, we setup the functions that will tie the
scrolling to the chapters and move the map from one location to another
while changing the zoom level, pitch and bearing */

map.on("load", function () {
  if (config.use3dTerrain) {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });
    // add the DEM source as a terrain layer with exaggerated height
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    // add a sky layer that will show when the map is highly pitched
    map.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-sun": [0.0, 0.0],
        "sky-atmosphere-sun-intensity": 15,
      },
    });
  }

  map.loadImage("icon/grey01_icon.png", (error, image) => { /*show grey icon (small business) */
    if (error) throw error;
    if (!map.hasImage("grey-icon")) {
      map.addImage("grey-icon", image);
    }
  
    map.addLayer(
      {
        id: "All_Data",  /*原turnstileData */
        type: "symbol",
        source: {
          type: "geojson",
          data: "data/Queens_Chinese_Restaurants_Typed0426.geojson",
        },
        layout: {
          "icon-image": "grey-icon",
          "icon-size": 0.075, // 可调整大小
          "icon-allow-overlap": true, // 避免被遮挡
        },
        paint: {
          "icon-opacity": 0, // 初始的时候不显示
        },
      },
      "road-label-simple"
    );
  });
  

  map.loadImage("icon/black01_icon.png", (error, image) => { /*show grey icon (small business) */
    if (error) throw error;
    if (!map.hasImage("black-icon")) {
      map.addImage("black-icon", image);
    }
  
    map.addLayer(
      {
        id: "Smallbusiness_Data",  /*原turnstileData */
        type: "symbol",
        source: {
          type: "geojson",
          data: "data/Queens_Chinese_Restaurants_Typed0426.geojson",
        },
        layout: {
          "icon-image": "black-icon",
          "icon-size": 0.075, // 可调整大小
          "icon-allow-overlap": true, // 避免被遮挡
        },
        paint: {
          "icon-opacity": 0, // 初始的时候不显示
        },
        filter: ["==", ["get", "TYPE"], "SMALL"], // 只显示 SMALL 类型
      },
      "road-label-simple"
    );
  });
  
  map.loadImage("icon/blue01_icon.png", (error, image) => { /*show red icon (chains) */
    if (error) throw error;
    if (!map.hasImage("Red-icon")) {
      map.addImage("Red-icon", image);
    }
  
    map.addLayer(
      {
        id: "Chain_Data",  /*原turnstileData */
        type: "symbol",
        source: {
          type: "geojson",
          data: "data/Queens_Chinese_Restaurants_Typed0426.geojson",
        },
        layout: {
          "icon-image": "Red-icon",
          "icon-size": 0.075, // 可调整大小
          "icon-allow-overlap": true, // 避免被遮挡
        },
        paint: {
          "icon-opacity": 0, // 初始的时候不显示
        },
        filter: ["==", ["get", "TYPE"], "CHAIN"], // 只显示 SMALL 类型
      },
      "road-label-simple"
    );
    map.moveLayer("Chain_Data"); // 把这个图层移到最顶层
  });

  
  




  map.addLayer(
    {
      id: "Downtown_Flushing",
      type: "line",
  source: {
    type: "geojson",
    data: "data/downtown_flushing.geojson"
  },
  paint: {
    "line-color": "#000000",
    "line-opacity": 0, // 初始的时候不显示
    "line-width": 2.5    //   线宽
  }
  });
  

  // --------------------------------------加入全部图表--------------------------------------
  

  // basechart
map.addSource('basechart-image', {
  type: 'image',
  url: 'images/basechart.png',
  coordinates: [
    [-73.89, 40.786],
    [-73.80, 40.786],
    [-73.80, 40.744],
    [-73.89, 40.744]
  ]
});

    // New_Restaurant
map.addSource('new-restaurant-image', {
  type: 'image',
  url: 'images/New_Restaurant.png',
  coordinates: [
    [-73.89, 40.786],
    [-73.80, 40.786],
    [-73.80, 40.744],
    [-73.89, 40.744]
  ]
});

// HighEnd_Restaurants
map.addSource('highend-restaurant-image', {
  type: 'image',
  url: 'images/HighEnd_Restaurants.png',
  coordinates: [
    [-73.89, 40.786],
    [-73.80, 40.786],
    [-73.80, 40.744],
    [-73.89, 40.744]
  ]
});

// Rising_Proportion
map.addSource('rising-proportion-image', {
  type: 'image',
  url: 'images/Rising_Proportion.png',
  coordinates: [
    [-73.89, 40.786],
    [-73.80, 40.786],
    [-73.80, 40.744],
    [-73.89, 40.744]
  ]
});
map.addSource('comparison-image', {
  type: 'image',
  url: 'images/Rising_Proportion2.png', // 注意路径，应该和你原来图片放的地方一致
  coordinates: [
    [-73.89, 40.786],  // 左上
    [-73.80, 40.786],  // 左下
    [-73.80, 40.744],  // 右下
    [-73.89, 40.744]   // 右上
  ]    
  
  
});

// ----------------------------Prince--------------------------
map.addSource('princeA-image', {
  type: 'image',
  url: 'images/princeA.png',
  coordinates: [
    [-73.84090002371707, 40.76236332307363],  //左上
    [-73.82823218062641, 40.76236332307363],  //右上
    [-73.82823218062641, 40.75654922093445],  //右 下
    [-73.84090002371707, 40.75654922093445]   //左 下 
  ]
});
map.addSource('prince0-image', {
  type: 'image',
  url: 'images/prince0.png',
  coordinates: [
    [-73.84090002371707, 40.76236332307363],  //左上
    [-73.82823218062641, 40.76236332307363],  //右上
    [-73.82823218062641, 40.75654922093445],  //右 下
    [-73.84090002371707, 40.75654922093445]   //左 下 
  ]
});
map.addSource('prince1-image', {
  type: 'image',
  url: 'images/prince1.png',
  coordinates: [
    [-73.84090002371707, 40.76236332307363],  //左上
    [-73.82823218062641, 40.76236332307363],  //右上
    [-73.82823218062641, 40.75654922093445],  //右 下
    [-73.84090002371707, 40.75654922093445]   //左 下 
  ]
});
map.addSource('prince2-image', {
  type: 'image',
  url: 'images/prince2.png',
  coordinates: [
    [-73.84090002371707, 40.76236332307363],  //左上
    [-73.82823218062641, 40.76236332307363],  //右上
    [-73.82823218062641, 40.75654922093445],  //右 下
    [-73.84090002371707, 40.75654922093445]   //左 下 
  ]
});
map.addSource('prince3-image', {
  type: 'image',
  url: 'images/prince3.png',
  coordinates: [
    [-73.84090002371707, 40.76236332307363],  //左上
    [-73.82823218062641, 40.76236332307363],  //右上
    [-73.82823218062641, 40.75654922093445],  //右 下
    [-73.84090002371707, 40.75654922093445]   //左 下 
  ]
});
map.addSource('prince4-image', {
  type: 'image',
  url: 'images/prince4.png',
  coordinates: [
    [-73.84090002371707, 40.76236332307363],  //左上
    [-73.82823218062641, 40.76236332307363],  //右上
    [-73.82823218062641, 40.75654922093445],  //右 下
    [-73.84090002371707, 40.75654922093445]   //左 下 
  ]
});
map.addSource('prince5-image', {
  type: 'image',
  url: 'images/prince5.png',
  coordinates: [
    [-73.84090002371707, 40.76236332307363],  //左上
    [-73.82823218062641, 40.76236332307363],  //右上
    [-73.82823218062641, 40.75654922093445],  //右 下
    [-73.84090002371707, 40.75654922093445]   //左 下 
  ]
});
map.addSource('prince6-image', {
  type: 'image',
  url: 'images/prince6.png',
  coordinates: [
    [-73.84090002371707, 40.76236332307363],  //左上
    [-73.82823218062641, 40.76236332307363],  //右上
    [-73.82823218062641, 40.75654922093445],  //右 下
    [-73.84090002371707, 40.75654922093445]   //左 下 
  ]
});
map.addSource('prince7-image', {
  type: 'image',
  url: 'images/prince7.png',
  coordinates: [
    [-73.84090002371707, 40.76236332307363],  //左上
    [-73.82823218062641, 40.76236332307363],  //右上
    [-73.82823218062641, 40.75654922093445],  //右 下
    [-73.84090002371707, 40.75654922093445]   //左 下 
  ]
});
map.addSource('prince8-image', {
  type: 'image',
  url: 'images/prince8.png',
  coordinates: [
    [-73.84090002371707, 40.76236332307363],  //左上
    [-73.82823218062641, 40.76236332307363],  //右上
    [-73.82823218062641, 40.75654922093445],  //右 下
    [-73.84090002371707, 40.75654922093445]   //左 下 
  ]
});map.addSource('prince9-image', {
  type: 'image',
  url: 'images/prince9.png',
  coordinates: [
    [-73.84090002371707, 40.76236332307363],  //左上
    [-73.82823218062641, 40.76236332307363],  //右上
    [-73.82823218062641, 40.75654922093445],  //右 下
    [-73.84090002371707, 40.75654922093445]   //左 下 
  ]
});


// --------------------------------------把图表全部转换成图层--------------------------------------
  map.addLayer({
    id: 'comparison-layer',
    type: 'raster',
    source: 'comparison-image',
    paint: {
      'raster-opacity': 0, // 初始是透明的
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  
  map.addLayer({
    id: 'basechart-layer',
    type: 'raster',
    source: 'basechart-image',
    paint: {
      'raster-opacity': 0, // 初始是透明的
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  map.addLayer({
    id: 'new-restaurant-layer',
    type: 'raster',
    source: 'new-restaurant-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  
  map.addLayer({
    id: 'highend-restaurant-layer',
    type: 'raster',
    source: 'highend-restaurant-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  
  map.addLayer({
    id: 'rising-proportion-layer',
    type: 'raster',
    source: 'rising-proportion-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });

  map.addLayer({
    id: 'princeA-layer',
    type: 'raster',
    source: 'princeA-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  map.addLayer({
    id: 'prince0-layer',
    type: 'raster',
    source: 'prince0-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });

  map.addLayer({
    id: 'prince1-layer',
    type: 'raster',
    source: 'prince1-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });

  map.addLayer({
    id: 'prince2-layer',
    type: 'raster',
    source: 'prince2-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  map.addLayer({
    id: 'prince3-layer',
    type: 'raster',
    source: 'prince3-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  map.addLayer({
    id: 'prince4-layer',
    type: 'raster',
    source: 'prince4-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  map.addLayer({
    id: 'prince5-layer',
    type: 'raster',
    source: 'prince5-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  map.addLayer({
    id: 'prince6-layer',
    type: 'raster',
    source: 'prince6-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  map.addLayer({
    id: 'prince7-layer',
    type: 'raster',
    source: 'prince7-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  map.addLayer({
    id: 'prince8-layer',
    type: 'raster',
    source: 'prince8-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  map.addLayer({
    id: 'prince9-layer',
    type: 'raster',
    source: 'prince9-image',
    paint: {
      'raster-opacity': 0,
      'raster-opacity-transition': {
  duration: 1000,
  delay: 0
}
    }
  });
  

  

  

  // setup the instance, pass callback functions
  scroller
    .setup({
      step: ".step",
      offset: 0.7,
      progress: true,
    })
    .onStepEnter(async (response) => {
      var current_chapter = config.chapters.findIndex(
        (chap) => chap.id === response.element.id
      );
      var chapter = config.chapters[current_chapter];


      
      
      
      

      response.element.classList.add("active");
      map[chapter.mapAnimation || "flyTo"](chapter.location);

      if (config.showMarkers) {
        marker.setLngLat(chapter.location.center);
      }
      if (chapter.onChapterEnter.length > 0) {
        chapter.onChapterEnter.forEach(setLayerOpacity);
      }
      if (chapter.callback) {
        window[chapter.callback]();
      }
      if (chapter.rotateAnimation) {
        map.once("moveend", () => {
          const rotateNumber = map.getBearing();
          map.rotateTo(rotateNumber + 180, {
            duration: 30000,
            easing: function (t) {
              return t;
            },
          });
        });
      }
      if (config.auto) {
        var next_chapter = (current_chapter + 1) % config.chapters.length;
        map.once("moveend", () => {
          document
            .querySelectorAll(
              '[data-scrollama-index="' + next_chapter.toString() + '"]'
            )[0]
            .scrollIntoView();
        });
      }
    })
    
    /*------------重新显示图片-------------*/
    .onStepExit((response) => {
      var chapter = config.chapters.find(
        (chap) => chap.id === response.element.id
      );
      response.element.classList.remove("active");
    
      if (["overallMap5", "overallMap501", "overallMap502"].includes(chapter.id)) {
        document.getElementById("map").style.visibility = "visible";
        document.getElementById("map-overlay").style.display = "none";
        document.getElementById("img-5").style.display = "none";
        document.getElementById("img-501").style.display = "none";
        document.getElementById("img-502").style.display = "none";
        document.getElementById("img-503").style.display = "none";
      }
    
      if (chapter.onChapterExit.length > 0) {
        chapter.onChapterExit.forEach(setLayerOpacity);
      }
    });
    

  if (config.auto) {
    document.querySelectorAll('[data-scrollama-index="0"]')[0].scrollIntoView();
  }
});