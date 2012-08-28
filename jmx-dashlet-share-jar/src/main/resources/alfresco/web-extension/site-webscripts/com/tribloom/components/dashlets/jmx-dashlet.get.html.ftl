<#assign jsId = args.htmlid?js_string?replace("-","_") />
<script>//<![CDATA[

	// Instantiate JMX Dashlet Object
	var ${jsId}_dashlet = 
		new Alfresco.dashlet.JMXDashlet("${args.htmlid}").setOptions({
		"componentId" : "${instance.object.id}"<#if refreshInterval??>, 
		"refreshInterval" : "${refreshInterval?string}"</#if><#if units??>,
		"units" : "${units?string}"</#if><#if height??>,
		"height" : ${height}</#if><#if vizlib??>,
		"vizlib" : "${vizlib}"</#if>
	}).setMessages(${messages});
	
	// Add DashletResizer to panel
	var ${jsId}_resizer = 
		new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");

	// Add end resize event handler
	var timer = YAHOO.lang.later(1000, this, function(dashlet, resizer) {
		if (resizer.widgets.resizer) {
			resizer.widgets.resizer.on("endResize", function(eventTarget) {
				dashlet.onEndResize(eventTarget.height);
			}, dashlet, true);
			timer.cancel();
		}
	}, [${jsId}_dashlet, ${jsId}_resizer], true);
	 
//]]</script>
<div id="${args.htmlid}-jmxdashlet" class="dashlet">
	<div id="${args.htmlid}-jmxdashlet-title" class="title">${msg("label.header")}</div>
	<div id="${args.htmlid}-jmxdashlet-body" class="body jmxdashlet">
		<div id="${args.htmlid}-jmxdashlet-toolbar" class="toolbar">
			<span class="align-left yui-button-align">
				<span class="first-child">
					<a id="${args.htmlid}-jmxdashlet-config-link" class="theme-color-1" href="#">
						${msg("label.configure")}
					</a>
				</span>
			</span>
		</div>
		<div class="dashlet-content scrollable">
			<h3 id="${args.htmlid}-title" class="jmxdashlet-title"></h3>
			<div id="${args.htmlid}-jmxdashlet-main" class="jmxdashlet-main"></div>
			<div id="${args.htmlid}-jmxdashlet-moreinfo" class="jmxdashlet-moreinfo"></div>
		</div>
	</div>
</div>