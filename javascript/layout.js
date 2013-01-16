dojo.require("esri.map");
dojo.require('esri.dijit.Attribution');
dojo.require("esri.arcgis.utils");
dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.TimeSlider");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.IdentityManager");

  var map, urlObject;
  var timeSlider;
  var timeProperties = null;
  var i18n;

function initMap() {
	//get the localization strings
	i18n = dojo.i18n.getLocalization("esriTemplate", "template");

	//read the legend header text from the localized strings file
	dojo.byId('legendHeader').innerHTML = i18n.tools.legend.label;

	if (configOptions.geometryserviceurl && location.protocol === "https:") {
		configOptions.geometryserviceurl = configOptions.geometryserviceurl.replace('http:', 'https:');
	}
	esri.config.defaults.geometryService = new esri.tasks.GeometryService(configOptions.geometryserviceurl);

	if (!configOptions.sharingurl) {
		configOptions.sharingurl = location.protocol + '//' + location.host + "/sharing/content/items";
	}
	esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;

	if (!configOptions.proxyurl) {
		configOptions.proxyurl = location.protocol + '//' + location.host + "/sharing/proxy";
	}

	esri.config.defaults.io.proxyUrl = configOptions.proxyurl;

	esri.config.defaults.io.alwaysUseProxy = false;

	urlObject = esri.urlToObject(document.location.href);
	urlObject.query = urlObject.query || {};
	config = utils.applyOptions(config, urlObject.query);
	
	if(urlObject.query.appid)
	{		
		appRequest = esri.arcgis.utils.getItem(config.appid);
	
		//getItem provides a deferred object; set onAppData to load when the request completes
		appRequest.then(onAppData);
	}
	else
	{
		setUpMap();
	}

}

function onAppData (result) {

		//The configuration properties are stored in the itemData.values property of the result
		//Update the config variable
		config = utils.applyOptions(config, result.itemData.values);
		//Apply any UI changes
		
		console.log(result.itemData.values)
		
		
		setUpMap()
}

function setUpMap () {
  		var itemDeferred = esri.arcgis.utils.getItem(config.webmap);

     
        var mapDeferred = esri.arcgis.utils.createMap(config.webmap, "map", {
          mapOptions: {
            slider: true,
            sliderStyle:'small',
            nav: false,
            showAttribution:true,
            wrapAround180:true
          },
          ignorePopups:false,
          bingMapsKey: configOptions.bingmapskey
        }); 

        mapDeferred.addCallback(function (response) {
		  document.title = configOptions.title ||response.itemInfo.item.title;	
          dojo.byId("title").innerHTML =  config.title ||response.itemInfo.item.title;
          dojo.byId("subtitle").innerHTML = config.subtitle || response.itemInfo.item.snippet || "";
       

        
          map = response.map;
          var layers = response.itemInfo.itemData.operationalLayers;
          //get any time properties that are set on the map
          if(response.itemInfo.itemData.widgets && response.itemInfo.itemData.widgets.timeSlider){
            timeProperties =  response.itemInfo.itemData.widgets.timeSlider.properties;
          }
          if(map.loaded){
              initUI(layers);
            }
            else{
              dojo.connect(map,"onLoad",function(){
                initUI(layers);
              });
           } 
          //resize the map when the browser resizes
          dojo.connect(dijit.byId('map'), 'resize', map,map.resize);
        });

        mapDeferred.addErrback(function (error) {
          alert(i18n.viewer.errors.createMap + " : " +  error.message);
        }); 
}
    
    var utils = {
	applyOptions : function(configVariable, newConfig) {
			var q;
	
			//Override any config options with query parameters
			for(q in newConfig) {
				configVariable[q] = newConfig[q];
			}
			return configVariable;
		},
		mapResize : function(mapNode) {
			//Have the map resize on a window resize
			dojo.connect(dijit.byId('map'), 'resize', map, map.resize);
		},
		onError : function(error) {
			console.log('Error occured')
			console.log(error);
		}
	}	
   
   function initUI(layers) {
    //add chrome theme for popup
    dojo.addClass(map.infoWindow.domNode, "chrome");
    //add the scalebar 
    var scalebar = new esri.dijit.Scalebar({
      map: map,
      scalebarUnit: i18n.viewer.main.scaleBarUnits //metric or english
    }); 
    
    //create the legend - exclude basemaps and any note layers
    var layerInfo = buildLayersList(layers);  
    if(layerInfo.length > 0){
      var legendDijit = new esri.dijit.Legend({
        map:map,
        layerInfos:layerInfo
      },"legendDiv");
      legendDijit.startup();
    }
    else{
      dojo.byId('legendDiv').innerHTML = i18n.tools.legend.layerMessage;
    }
    
    //check to see if the web map has any time properties
    
    if(timeProperties){
      
      //alert(config.totalWindowUnits)
      
      //Updates the Map Time extent based off the configuration parameters
      fullTimeExtent = getFullTimeExtent();
      
      map.setTimeExtent(fullTimeExtent);
      
      //create the slider
      timeSlider = new esri.dijit.TimeSlider({
        style: "width: 100%;"
      }, dojo.byId("timeSliderDiv"));
      
      map.setTimeSlider(timeSlider);
      //Set time slider properties 
      timeSlider.setThumbCount(timeProperties.thumbCount);
      //timeSlider.setThumbMovingRate(timeProperties.thumbMovingRate);
      timeSlider.setThumbMovingRate(config.timerSpeed);
      
      timeSlider.loop = config.loop;
      
      var timeStep = config.timeStep;
      var timestepUnits = config.timeStepUnits;
      
      timeSlider.createTimeStopsByTimeInterval(fullTimeExtent,timeStep,timestepUnits);

     
      //set the thumb index values if the count = 2
      if(timeSlider.thumbCount ==2){
        timeSlider.setThumbIndexes([0,1]);
      }
	  
      dojo.connect(timeSlider,'onTimeExtentChange',function(timeExtent){
        //update the time details span.
        var timeString; 
        if(timestepUnits  !== undefined)
        {
	        switch(timestepUnits)
	        {   
		        case 'esriTimeUnitsCenturies':	
		          datePattern = 'yyyy G';
		          break;          
		        case 'esriTimeUnitsDecades':
		          datePattern = 'yyyy';
		          break;  
		         case 'esriTimeUnitsYears':
		          datePattern = 'MMMM yyyy';
		          break;
		        case 'esriTimeUnitsWeeks':	 
		          datePattern = 'MMMM d, yyyy';
		          break;
		        case 'esriTimeUnitsDays':
		          datePattern = 'MMMM d, yyyy';
		          break;        
		        case 'esriTimeUnitsHours':
		          datePattern = 'h:m:s.SSS a';
		          break;
		        case 'esriTimeUnitsMilliseconds':
		          datePattern = 'h:m:s.SSS a';
		          break;          
		        case 'esriTimeUnitsMinutes':
		          datePattern = 'MMMM d, y h:m';
		          break;          
		        case 'esriTimeUnitsMonths':
		          datePattern = 'MMMM d, y';
		          break;          
		        case 'esriTimeUnitsSeconds':
		          datePattern = 'h:m:s.SSS a';
		          break;          
      		}

	       var startTime=formatDate(timeExtent.startTime,datePattern);
	       var endTime = formatDate(timeExtent.endTime,datePattern);
	       
	       timeString= esri.substitute({"start_time": startTime, "end_time": endTime}, i18n.tools.time.timeRange);
	       
       
      }
      else{

        //TODO: This should probably be a configurable
        datePattern = 'MMMM d, y h:m';
        var startTime=formatDate(timeExtent.startTime,datePattern);
        var endTime = formatDate(timeExtent.endTime,datePattern);
	 	timeString= esri.substitute({"start_time": startTime, "end_time": endTime}, i18n.tools.time.timeRange);

      }
      
      dojo.byId('timeSliderLabel').innerHTML =  timeString;
        
      });
	  
      timeSlider.startup();
      	  
   }
  }
  
  function getFullTimeExtent()
  {
  	  //Getting the previous two hours of precipitation data.
	  var startDate = new Date();
	  
	  var min = startDate.getMinutes();
	  var subMin = min/5;
	  var roundedMin = Math.floor(subMin);
	  var actualMin = roundedMin * 5;
	  
	  startDate.setMinutes(actualMin);
	  
	  var timeExtentUnits = config.totalWindowUnits;
	  var timeExtentValue = config.totalWindow;
	  
	  if(timeExtentUnits == "days")
	  {
	  	  startDate.setDate(startDate.getDate() - timeExtentValue);	
	  }
	  else if(timeExtentUnits == "hours")
	  {
	  	  startDate.setHours(startDate.getHours() - timeExtentValue);
	  }
	  else if(timeExtentUnits == "years")
	  {
	  	  startDate.setFullYear(startDate.getFullYear() - timeExtentValue);
	  }
	  else
	  {
	  	  startDate.setHours(startDate.getHours() - 2);
	  }
     	
      var startTime =  startDate; 
      
      //We need to update the end date also, to stop at the 5 min window.
      var endTime = new Date();
      endTime.setMinutes(actualMin);
            
      var fullTimeExtent = new esri.TimeExtent(new Date(startTime), new Date(endTime));
      
      return fullTimeExtent;
  }
  
  
  function formatDate(date,datePattern){
    return dojo.date.locale.format(date, {
        selector: 'date',
        datePattern: datePattern
      });
  }
  
  function buildLayersList(layers){

 //layers  arg is  response.itemInfo.itemData.operationalLayers;
  var layerInfos = [];
  dojo.forEach(layers, function (mapLayer, index) {
      var layerInfo = {};
      if (mapLayer.featureCollection && mapLayer.type !== "CSV") {
        if (mapLayer.featureCollection.showLegend === true) {
            dojo.forEach(mapLayer.featureCollection.layers, function (fcMapLayer) {
              if (fcMapLayer.showLegend !== false) {
                  layerInfo = {
                      "layer": fcMapLayer.layerObject,
                      "title": mapLayer.title,
                      "defaultSymbol": false
                  };
                  if (mapLayer.featureCollection.layers.length > 1) {
                      layerInfo.title += " - " + fcMapLayer.layerDefinition.name;
                  }
                  layerInfos.push(layerInfo);
              }
            });
          }
      } else if (mapLayer.showLegend !== false && mapLayer.layerObject) {
      var showDefaultSymbol = false;
      if (mapLayer.layerObject.version < 10.1 && (mapLayer.layerObject instanceof esri.layers.ArcGISDynamicMapServiceLayer || mapLayer.layerObject instanceof esri.layers.ArcGISTiledMapServiceLayer)) {
        showDefaultSymbol = true;
      }
      layerInfo = {
        "layer": mapLayer.layerObject,
        "title": mapLayer.title,
        "defaultSymbol": showDefaultSymbol
      };
        //does it have layers too? If so check to see if showLegend is false
        if (mapLayer.layers) {
            var hideLayers = dojo.map(dojo.filter(mapLayer.layers, function (lyr) {
                return (lyr.showLegend === false);
            }), function (lyr) {
                return lyr.id;
            });
            if (hideLayers.length) {
                layerInfo.hideLayers = hideLayers;
            }
        }
        layerInfos.push(layerInfo);
    }
  });
  return layerInfos;
  }
