var component = sitedata.getComponent(url.templateArgs.componentId);
var refreshInterval = String(json.get("refreshInterval"));
var units = String(json.get("units"));
var vizlib = String(json.get("vizlib"));
if (component != null) {
	component.properties["refreshInterval"] = refreshInterval;
	component.properties["units"] = units;
	component.properties["vizlib"] = vizlib;
	component.save();
}
model.refreshInterval = refreshInterval;
model.units = units;
model.vizlib = vizlib;