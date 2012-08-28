var component = null;
if (url.templateArgs.length > 0) {
	component = sitedata.getComponent(url.templateArgs.componentId);
}
model.refreshInterval = 60;
model.units = "MB";
if (component != null) {
	if (component.properties["refreshInterval"]) {
		model.refreshInterval = component.properties["refreshInterval"];
	}
	if (component.properties["units"]) {
		model.units = component.properties["units"];
	}
	if (component.properties["vizlib"]) {
		model.vizlib = component.properties["vizlib"];
	}
}