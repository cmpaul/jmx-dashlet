(function() {
	
	/**
	 * YUI Library Aliases
	 */
	var Dom = YAHOO.util.Dom;
	var Event = YAHOO.util.Event;
	var Connect = YAHOO.util.Connect;

	/**
	 * Constants
	 */
	var PRECISION = 2; // Number of decimal places to show
	var MAX_FAILURES = 3;
	var JMXCLIENT_URL = Alfresco.constants.PROXY_URI + 'jmxclient';
	var JMXCONFIG_URL = Alfresco.constants.URL_SERVICECONTEXT + "jmxdashlet/config";
	var MAX_DATASETS = 20;
	var DEFAULT_HEIGHT = 250;
	var MIN_HEIGHT = 50;
	var DEFAULT_MARGIN = 50;
	
	var VIEWS = {
		"heapMemoryUsage" : [
             "heapMemoryUsageCommitted",
             "heapMemoryUsageInit",
             "heapMemoryUsageMax",
             "heapMemoryUsageUsed"
         ],
         "nonHeapMemoryUsage" : [
			"nonHeapMemoryUsageCommitted",
			"nonHeapMemoryUsageInit",
			"nonHeapMemoryUsageMax",
			"nonHeapMemoryUsageUsed"
         ]
	};
	
	/**
	 * Alfresco.dashlet.JMXDashlet constructor
	 * 
	 * @param {String} ID
	 * @return {Alfresco.dashlet.JMXDashlet} instance
	 * @constructor
	 */
	Alfresco.dashlet.JMXDashlet = function _jmxDashletConstructor(htmlId) {
		Alfresco.dashlet.JMXDashlet.superclass.constructor.call(this, "Alfresco.dashlet.JMXDashlet", htmlId);
		this.configDialog = null;
		
		// Data structure to maintain JMX statistics
		this.dataSet = {
			values : [],
			push : function(data) {
				if (data == null) {
					return;
				}
				if (this.values.length == MAX_DATASETS) {
					this.values.shift();
				}
				this.values.push(data);
			},
			getValues : function(property) {
				if (property == null) {
					Alfresco.logger.error("Unable to retrieve JMX values for null property");
					return null;
				}
				var valueArray = [];
				for (var i = 0; i < this.values.length; i++) {
					var val = this.values[i];
					if (val[property] != undefined) {
						valueArray.push(val[property])
					}
				}
				return valueArray;
			}
		};
		
		this.defaultStat = "heapMemoryUsageUsed";
		this.currentStat = this.defaultStat;
		
		return this;
	};
	
	/**
	 * Extend the Alfresco.component.Base
	 */
	YAHOO.extend(Alfresco.dashlet.JMXDashlet, Alfresco.component.Base, {
		
		/**
		 * Dashlet options
		 */
		options : {
			componentId : "",
			refreshInterval : "60",
			units : "MB",
			consecutiveFailures : 0,
			height : DEFAULT_HEIGHT,
			gridHeight : DEFAULT_HEIGHT - DEFAULT_MARGIN,
			view : "heapMemoryUsage",
			vizlib : "raphael",
			unitsChanged : false
		},
		
		/**
		 * Called when the dashlet is first loaded.
		 */
		onReady : function _jmxDashletOnReady() {
			var configDashletLink = Dom.get(this.id + "-jmxdashlet-config-link");
			if (configDashletLink) {
				Event.addListener(configDashletLink, "click", this.onConfigLinkClick, this, true);
			}
			var dashletEl = Dom.get(this.id + "-jmxdashlet");
			if (dashletEl && this.options.height > 0) {
				dashletEl.style.height = String(this.options.height) + "px";
			}
			var mainEl = Dom.get(this.id + "-jmxdashlet-main");
			var toolbarEl = Dom.get(this.id + "-jmxdashlet-toolbar");
			var titleEl = Dom.get(this.id + "-jmxdashlet-title");
			if (dashletEl && mainEl && toolbarEl && titleEl) {
				this.options.gridHeight = dashletEl.clientHeight - (toolbarEl.clientHeight + titleEl.clientHeight) - DEFAULT_MARGIN;
			}
			
			YAHOO.util.Event.addListener(window, "resize", this.onEndResize, this, true);
			
			this.startRefresh();
		},
		
		/**
		 * Called when the user clicks the config Reposize link.
		 * Will open a Reposize config dialog
		 * 
		 * @param e The click event
		 */
		onConfigLinkClick : function _jmxDashletOnConfigLinkClick(e) {
			Event.stopEvent(e);
			var actionUrl = JMXCONFIG_URL + "/" + encodeURIComponent(this.options.componentId);
			if (!this.configDialog) {
				this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-jmxdashlet-config-dialog");
				this.configDialog.setOptions({
					width : "30em",
					templateUrl : JMXCONFIG_URL,
					actionUrl : actionUrl,
					onSuccess : {
						fn : function _jmxDashletConfigCallback(response) {
							var config = response.json;
							this.options.refreshInterval = config.refreshInterval;
							if (config.units != this.options.units) {
								this.options.unitsChanged = true;
							}
							this.options.units = config.units;
							this.options.vizlib = config.vizlib;
							this.startRefresh();
						},
						scope : this
					},
					doSetupFormsValidation : {
						fn : function _jmxDashletSetupFormCallback(form) {
							form.setShowSubmitStateDynamically(true, false);
							var select = Dom.get(this.configDialog.id + "-refreshInterval"),
								options = select.options,
								option, i, j;
							for (i = 0, j = options.length; i < j; i++) {
								option = options[i];
								if (option.value.localeCompare(this.options.refreshInterval) == 0) {
									option.selected = true;
									break;
								}
							}
							select = Dom.get(this.configDialog.id + "-units");
							if (select) {
								options = select.options;
								for (i = 0, j = options.length; i < j; i++) {
									option = options[i];
									if (option.value.localeCompare(this.options.units) == 0) {
										option.selected = true;
										break;
									}
								}
							}
							select = Dom.get(this.configDialog.id + "-vizlib");
							if (select) {
								options = select.options;
								for (i = 0, j = options.length; i < j; i++) {
									option = options[i];
									if (option.value.localeCompare(this.options.vizlib) == 0) {
										option.selected = true;
										break;
									}
								}
							}
						},
						scope : this
					}
				});
			}
			this.configDialog.setOptions({
				actionUrl : actionUrl
			});
			this.configDialog.show();
		},
		
		/**
		 * Converts the given value (in bytes) to the currently selected
		 * unit (B, KB, MB, or GB). Returns the converted value to a 
		 * predefined PRECISION.
		 * 
		 * @param value size (in bytes) to be converted
		 * @return convertedValue 
		 */
		calculateSize : function _jmxDashletCalculateSize(value) {
			if (this.options.units == 'B') {
				return value;
			}  
			var conversionFactor = 1024;
			if (this.options.units == 'MB') {
				conversionFactor = 1024 * 1024;
			} else if (this.options.units == 'GB') {
				conversionFactor = 1024 * 1024 * 1024;
			}
			return (value / conversionFactor).toFixed(PRECISION);
		},
		
		/**
		 * Updates the Dashlet UI with new values provided by the 
		 * JSON object returned by a webscript call (data).
		 * 
		 * @param data JSON object
		 */
		updateDashlet : function _jmxDashletUpdateDashlet(data, h, w) {
			Alfresco.logger.info("Updating JMX Dashlet...");
			
			if (data != null) {
				this.dataSet.push(data);
			}
			
			var width = w, height = h;
			var mainElId = this.id + "-jmxdashlet-main";
			var mainEl = Dom.get(mainElId);
			if (!mainEl) {
				Alfresco.logger.error("Error during JMX Dashlet update: Unable to locate " + mainElId);
				return;
			}
			var rect = mainEl.getBoundingClientRect();
			if (rect) {
				if (!width) {
					width = rect.width - 10;
				}
				if (!height) {
					var currentHeight = this.options.gridHeight;
					if (this.options.gridHeight < MIN_HEIGHT) {
						currentHeight = MIN_HEIGHT;
					}
					height = ((rect.height > 0) ? rect.height : currentHeight);
				}
			}
			
			if (this.options.vizlib == "raphael") {
				this.drawRaphaelGrid(data, height, width);
			} else {
				this.drawD3Grid(data, height, width);
			}
		},
		
		drawD3Grid : function _jmxDashletD3Grid(data, h, w) {
			var mainEl = Dom.get(this.id + "-jmxdashlet-main");
			
			// Convert current values to a stack
			var dataStack = [];
			/*
			 * dataStack = 
			 * [
			 * 		{
			 * 			"name" : "heapMemoryUsageCommitted",
			 * 			"values" : [
			 * 				{ "x" : 1345949385513, "y" : 343085056 },
			 * 				{ "y" : 1345949385514, "y" : 343085057 }
			 * 			]
			 * 		},
			 * 		{
			 * 			name: "heapMemoryUsageInit",
			 * 			values : [
			 *				{ "x" : 1345949385513, "y" : 134217728 },
			 * 				{ "y" : 1345949385514, "y" : 134217729 }
			 * 			]
			 * 		},
			 * 		{
			 * 			name: "heapMemoryUsageMax",
			 * 			values : [
			 *				{ "x" : 1345949385513, "y" : 1065025536 },
			 * 				{ "y" : 1345949385514, "y" : 1065025536 }
			 * 			]
			 * 		},
			 * 		{
			 * 			name: "heapMemoryUsageUsed",
			 * 			values : [
			 *				{ "x" : 1345949385513, "y" : 221581192 },
			 * 				{ "y" : 1345949385514, "y" : 221581192 }
			 * 			]
			 * 		}
			 * ]
			 */
			 
			/* Get the current view's properties...
			 * e.g., 
			 * "heapMemoryUsage" : [
		             "heapMemoryUsageCommitted",
		             "heapMemoryUsageInit",
		             "heapMemoryUsageMax",
		             "heapMemoryUsageUsed"
		         ],
			 */
			var viewProperties = VIEWS[this.options.view];
			
			// Using the view properties, iterate over the dataSet
			// and pull each property out, adding it to an object
			// that is then added to the stack.
			for (var i = 0; i < viewProperties.length; i++) {
				var viewProperty = viewProperties[i];
				var viewPropertyObj = {};
				viewPropertyObj.name = viewProperty;
				viewPropertyObj.values = [];
				for (var j = 0; j < this.dataSet.values.length; j++) {
					var set = this.dataSet.values[j];
					var setTime = set.time; 		// X-axis value
					var setVal = set[viewProperty]; // Y-axis value
					var setObj = {};
					setObj.x = setTime;
					setObj.y = setVal;
					setObj.y0 = 0;
					viewPropertyObj.values.push(setObj);
				}
				dataStack.push(viewPropertyObj);
			}
			
			var stack = d3.layout.stack().offset("zero").values(function(d) { return d.values; });
			
			// TODO: Finish the d3 visualization
		},
		
		drawRaphaelGrid : function _jmxDashletRaphaelGrid(data, height, width) {
			
			var mainEl = Dom.get(this.id + "-jmxdashlet-main");
			
			// Update title
			var messageProperty = "label.view." + this.options.view;
			var message = this.msg(messageProperty);
			var titleEl = Dom.get(this.id + "-title");
			if (titleEl != null) {
				titleEl.innerHTML = message;
			}
			
			if (data && this.options.view == "heapMemoryUsage") {
				var moreinfoEl = Dom.get(this.id + "-jmxdashlet-moreinfo");
				var heapMemoryCurrent = "Current: " + this.calculateSize(data.heapMemoryUsageUsed) + this.options.units;
				var heapMemoryMax = "Max: " + this.calculateSize(data.heapMemoryUsageMax) + this.options.units;
				var heapMemoryCommitted = "Committed: " + this.calculateSize(data.heapMemoryUsageCommitted) + this.options.units;
				var heapMemoryInit = "Init: " + this.calculateSize(data.heapMemoryUsageInit) + this.options.units;
				moreinfoEl.innerHTML = heapMemoryCurrent + " / " + heapMemoryMax + " / " + heapMemoryCommitted + " / " + heapMemoryInit;
			}
			
			if (this.r == undefined) {
				Alfresco.logger.info("Creating RaphaelJS object, sized (" + width + "," + height + ")");
				this.r = Raphael(mainEl, width, height);
			} else {
				this.r.clear();
				this.r.setSize(width, height);
			}
//			var currentStats = this.dataSet.getValues(this.currentStat);
			var currentStats = this.dataSet.values;
			if (currentStats == null) {
				return;
			}
			var valueArray = [];
			for (var statCount = 0; statCount < currentStats.length; statCount++) {
				var stat = currentStats[statCount];
				valueArray.push(this.calculateSize(stat[this.currentStat]));
			}
			var newMax = Math.max.apply(Math, valueArray) * 2;
			if (this.max == undefined) {
				this.max = newMax;
			} else {
				if (this.options.unitsChanged || (this.max * 2) == newMax) {
					this.max = newMax;
					this.options.unitsChanged = false;
				}
			}
			var leftgutter = 10, bottomgutter = 10, topgutter = 10, colorhue = .6 || Math.random(),
				color = "hsl(" + [colorhue, .5, .5] + ")",
				X = (width - leftgutter) / MAX_DATASETS,
				Y = (height - bottomgutter - topgutter) / this.max;
			this.r.drawGrid(leftgutter + X * .5 + .5, topgutter + .5, width - leftgutter - X, height - topgutter - bottomgutter, 10, 10, "#CCC");
			
			var path = this.r.path().attr({stroke: color, "stroke-width": 4, "stroke-linejoin": "round"}),
				bgp = this.r.path().attr({stroke: "none", opacity: .3, fill: color}),
				label = this.r.set(),
				lx = 0, ly = 0,
				is_label_visible = false,
				leave_timer,
				blanket = this.r.set(),
				txt = {font: '12px Helvetica, Arial', fill: "#fff"},
				txt1 = {font: '10px Helvetica, Arial', fill: "#fff"},
				txt2 = {font: '12px Helvetica, Arial', fill: "#000"};
			label.push(this.r.text(60, 12, "Value").attr(txt));
			label.push(this.r.text(60, 27, "Time").attr(txt1).attr({fill: color}));
			label.hide();
			var frame = this.r.popup(100, 100, label, "right").attr({fill: "#000", stroke: "#666", "stroke-width": 2, "fill-opacity": .7}).hide();
			
		    var p, bgpp;
		    for (var i = 0, ii = currentStats.length; i < ii; i++) {
		    	var data = currentStats[i];
		    	var value = data[this.currentStat];
		    	var dataPointTime = new Date(data["time"]);
		    	var labelText = dataPointTime.getHours().pad(2) + ":" + 
		    					dataPointTime.getMinutes().pad(2) + ":" + 
		    					dataPointTime.getSeconds().pad(2);
		    	if (!isNaN(parseFloat(value)) && isFinite(value)) {
		    		value = this.calculateSize(value);
		    		var y = Math.round(height - bottomgutter - Y * value),
		    			x = Math.round(leftgutter + X * (i + .5)),
		    			t = this.r.text(x, height - 6, labelText).attr(txt).toBack();
		    		if (!i) {
		    			p = ["M", x, y, "C", x, y];
		    			bgpp = ["M", leftgutter + X * .5, height - bottomgutter, "L", x, y, "C", x, y];
		    		}
		    		var dot = this.r.circle(x, y, 4).attr({fill: "#333", stroke: color, "stroke-width": 2});
		    		blanket.push(this.r.rect(leftgutter + X * i, 0, X, height - bottomgutter).attr({stroke: "none", fill: "#fff", opacity: 0}));
		    		var rect = blanket[blanket.length - 1];
		    		(function (self, x, y, data, lbl, dot) {
			            var timer, i = 0;
			            rect.hover(function () {
			                clearTimeout(leave_timer);
			                var side = "right";
			                if (x + frame.getBBox().width > width) {
			                    side = "left";
			                }
			                var ppp = self.r.popup(x, y, label, side, 1),
			                    anim = Raphael.animation({
			                        path: ppp.path,
			                        transform: ["t", ppp.dx, ppp.dy]
			                    }, 200 * is_label_visible);
			                lx = label[0].transform()[0][1] + ppp.dx;
			                ly = label[0].transform()[0][2] + ppp.dy;
			                frame.show().stop().animate(anim);
			                var dataLbl = String(data)  + " " + self.msg("label.units." + self.options.units);
			                label[0].attr({text: dataLbl}).show().stop().animateWith(frame, anim, {transform: ["t", lx, ly]}, 200 * is_label_visible);
			                label[1].attr({text: lbl}).show().stop().animateWith(frame, anim, {transform: ["t", lx, ly]}, 200 * is_label_visible);
			                dot.attr("r", 6);
			                is_label_visible = true;
			            }, function () {
			                dot.attr("r", 4);
			                leave_timer = setTimeout(function () {
			                    frame.hide();
			                    label[0].hide();
			                    label[1].hide();
			                    is_label_visible = false;
			                }, 1);
			            });
			        })(this, x, y, value, labelText, dot);
				    p = p.concat([x, y, x, y]);
				    bgpp = bgpp.concat([x, y, x, y, "L", x, height - bottomgutter, "z"]);
				    path.attr({path: p});
				    bgp.attr({path: bgpp});
				    frame.toFront();
				    label[0].toFront();
				    label[1].toFront();
				    blanket.toFront();
		    	}
		    }
		},
		
		onEndResize : function(h) {
			var dashletEl = Dom.get(this.id + "-jmxdashlet");
//			var width = dashletEl.clientWidth - DEFAULT_MARGIN;
			var height = dashletEl.clientHeight;
			
			var dashletTitleEl = Dom.get(this.id + "-jmxdashlet-title");
			height -= dashletTitleEl.clientHeight;
			
			var toolbarEl = Dom.get(this.id + "-jmxdashlet-toolbar");
			height -= toolbarEl.clientHeight;
			
			var moreinfoEl = Dom.get(this.id + "-jmxdashlet-moreinfo");
			height -= moreinfoEl.clientHeight;
			
			height -= DEFAULT_MARGIN;
			this.updateDashlet(null, height);
		},
		
		/**
		 * Performs an asynchronous request to the GetRepoSize webscript, 
		 * retrieving the latest values for the dashlet, and updates the
		 * UI component with the new data.
		 */
		refreshComponent : function _jmxDashletRefreshComponent() {
			var self = this;
			var success = function _success(response) {
				if (response.responseText != "") {
					var data = eval('(' + response.responseText + ')');
					if (data) {
						self.consecutiveFailures = 0;
						self.updateDashlet(data);
						return;
					}
				}
				// Repository is unavailable or sending an incorrect response
				failure();
			};
			var failure = function _failure(response) {
				if (self.consecutiveFailures < MAX_FAILURES) {
					self.consecutiveFailures++;
					Alfresco.logger.error("Webscript call failed " + self.consecutiveFailures + " time(s).");
				} else {
					self.stopRefresh();
					self.options.refreshInterval = -1;
					Alfresco.logger.error(MAX_FAILURES + " failures reached. Auto-refresh cancelled.");
				}
			};
			Connect.asyncRequest("GET", JMXCLIENT_URL, {
				success : success,
				failure : failure
			}, null);
		},
		
		/**
		 * Performs a dashlet update and renews the auto-refresh interval. 
		 */
		startRefresh : function _jmxDashletStartRefresh() {
			this.stopRefresh();
			this.refreshComponent();
			if (this.options.refreshInterval > 0) {
				var self = this;
				this.interval = setInterval(function() {
					self.refreshComponent();
				}, this.options.refreshInterval * 1000);
			}
		},
		
		/**
		 * Cancels the current auto-refresh.
		 */
		stopRefresh : function _jmxDashletStopRefresh() {
			if (this.interval) {
				clearInterval(this.interval);
				this.interval == null;
			}
		}
	});
	
	/**
	 * Define a RaphaelJS function do draw a grid.
	 */
	Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color) {
	    color = color || "#000";
	    var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
	        rowHeight = h / hv,
	        columnWidth = w / wv;
	    for (var i = 1; i < hv; i++) {
	        path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
	    }
	    for (i = 1; i < wv; i++) {
	        path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
	    }
	    return this.path(path.join(",")).attr({stroke: color});
	};
	

	var tokenRegex = /\{([^\}]+)\}/g, 
		objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g; // matches .xxxxx or ["xxxxx"]
		
	var replacer = function(all, key, obj) {
		var res = obj;
		key.replace(objNotationRegex, function(all, name, quote, quotedName,
				isFunc) {
			name = name || quotedName;
			if (res) {
				if (name in res) {
					res = res[name];
				}
				typeof res == "function" && isFunc && (res = res());
			}
		});
		res = (res == null || res == obj ? all : res) + "";
		return res;
	}; 
	
	var fill = function(str, obj) {
		return String(str).replace(tokenRegex, function(all, key) {
			return replacer(all, key, obj);
		});
	};
	
	Raphael.fn.popup = function(X, Y, set, pos, ret) {
		pos = String(pos || "top-middle").split("-");
		pos[1] = pos[1] || "middle";
		var r = 5, bb = set.getBBox(), w = Math.round(bb.width), h = Math
				.round(bb.height), x = Math.round(bb.x) - r, y = Math
				.round(bb.y)
				- r, gap = Math.min(h / 2, w / 2, 10), shapes = {
			top : "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}l-{right},0-{gap},{gap}-{gap}-{gap}-{left},0a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
			bottom : "M{x},{y}l{left},0,{gap}-{gap},{gap},{gap},{right},0a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
			right : "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}l0-{bottom}-{gap}-{gap},{gap}-{gap},0-{top}a{r},{r},0,0,1,{r}-{r}z",
			left : "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}l0,{top},{gap},{gap}-{gap},{gap},0,{bottom}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z"
		}, offset = {
			hx0 : X - (x + r + w - gap * 2),
			hx1 : X - (x + r + w / 2 - gap),
			hx2 : X - (x + r + gap),
			vhy : Y - (y + r + h + r + gap),
			"^hy" : Y - (y - gap)
		}, mask = [ {
			x : x + r,
			y : y,
			w : w,
			w4 : w / 4,
			h4 : h / 4,
			right : 0,
			left : w - gap * 2,
			bottom : 0,
			top : h - gap * 2,
			r : r,
			h : h,
			gap : gap
		}, {
			x : x + r,
			y : y,
			w : w,
			w4 : w / 4,
			h4 : h / 4,
			left : w / 2 - gap,
			right : w / 2 - gap,
			top : h / 2 - gap,
			bottom : h / 2 - gap,
			r : r,
			h : h,
			gap : gap
		}, {
			x : x + r,
			y : y,
			w : w,
			w4 : w / 4,
			h4 : h / 4,
			left : 0,
			right : w - gap * 2,
			top : 0,
			bottom : h - gap * 2,
			r : r,
			h : h,
			gap : gap
		} ][pos[1] == "middle" ? 1 : (pos[1] == "top" || pos[1] == "left") * 2];
		var dx = 0, dy = 0, out = this.path(fill(shapes[pos[0]], mask))
				.insertBefore(set);
		switch (pos[0]) {
		case "top":
			dx = X - (x + r + mask.left + gap);
			dy = Y - (y + r + h + r + gap);
			break;
		case "bottom":
			dx = X - (x + r + mask.left + gap);
			dy = Y - (y - gap);
			break;
		case "left":
			dx = X - (x + r + w + r + gap);
			dy = Y - (y + r + mask.top + gap);
			break;
		case "right":
			dx = X - (x - gap);
			dy = Y - (y + r + mask.top + gap);
			break;
		}
		out.translate(dx, dy);
		if (ret) {
			ret = out.attr("path");
			out.remove();
			return {
				path : ret,
				dx : dx,
				dy : dy
			};
		}
		set.translate(dx, dy);
		return out;
	}; 
	
	Number.prototype.pad = function(len) {
		return (new Array(len + 1).join("0") + this).slice(-len);
	};
	
})();