var config = {
	title : 'Time Enabled Web Map',
	subtitle : 'Subtitle',
	description : '',
	loop : true,
	timerSpeed : '800',
	totalWindow : '1',
	totalWindowUnits :"hours",
	timeStep:"5",
	timeStepUnits:"esriTimeUnitsMinutes",
	//Webmap comes with app, but normally not manually specified
	webmap : '86b371186588440da82f36106937f825', //'660cd3f1db4349cdba107038a885b859',
	//Below are default values that aren't set by an application'
	appid : '9550e22d6c714a33b2448f65f67c5aa5', //'85a8862e90b047c8861e7680c5d4ca62', 
	proxy : '/proxy/proxy.ashx',
	arcgisUrl : null
}

//Application configuration specification as needed by ArcGIS Online Item
var _configSpecification = 
{
	"configurationSettings":
	[
		{
			"category":"General Settings",
			"fields":
			[
				{
					"type":"string",
					"fieldName":"title",
					"label":"Title",
					"stringFieldOption":"textbox",
					"placeHolder":""
				},
				{
					"type":"string",
					"fieldName":"subtitle",
					"label":"Subtitle",
					"stringFieldOption":"textbox",
					"placeHolder":""
				}
			]
		},
		{
			"category":"Time Settings",
			"fields":
			[
				{
					"type":"boolean",
					"fieldName":"loop",
					"label":"Enable Looping",
					"tooltip":""
				},
				{
					"type":"string",
					"fieldName":"timerSpeed",
					"label":"Slider Speed",
					"tooltip":"The speed at which the slider moves when played"
				},
				{
					"type":"string",
					"fieldName":"totalWindow",
					"label":"Time Extent",
					"stringFieldOption":"textbox",
					"placeHolder":"1"
				},
				{
					"type":"options",
					"fieldName":"totalWindowUnits",
					"tooltip":"Extent Units",
					"label":"Extent Units",
					"options":
					[
						{
							"label":"Hours",
							"value":"hours"
						},
						{
							"label":"Days",
							"value":"days"
						},
						{
							"label":"Weeks",
							"value":"weeks"
						},
						{
							"label":"Years",
							"value":"years"
						}
					]
				},
								{
					"type":"string",
					"fieldName":"timeStep",
					"label":"Time Step",
					"stringFieldOption":"textbox",
					"placeHolder":"5"
				},
				{
					"type":"options",
					"fieldName":"timeStepUnits",
					"tooltip":"Time Step units",
					"label":"Step Units",
					"options":
					[
						{
							"label":"Minutes",
							"value":"esriTimeUnitsMinutes"
						},
						{
							"label":"Hours",
							"value":"esriTimeUnitsHours"
						},
						{
							"label":"Days",
							"value":"esriTimeUnitsDays"
						},
						{
							"label":"Weeks",
							"value":"esriTimeUnitsWeeks"
						},
						{
							"label":"Years",
							"value":"esriTimeUnitsYears"
						}
					]
				}
			]
		}
	],
	"values":
	{	
		"title":"",
		"subtitle":"",
		"totalWindow":"1",
		"totalWindowUnits":"hours",
		"loop":true,
		"timerSpeed":"800",
		"timeStep":"5",
		"timeStepUnits":"esriTimeUnitsMinutes"
	}
}