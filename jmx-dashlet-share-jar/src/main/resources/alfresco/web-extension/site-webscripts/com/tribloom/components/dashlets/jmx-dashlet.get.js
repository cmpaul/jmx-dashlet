var refreshInterval = args.refreshInterval;
var units = args.units;
var vizlib = args.vizlib;

var conf = new XML(config.script);
if (!refreshInterval) {
	refreshInterval = conf.refreshInterval[0];
}
if (!units) {
	units = conf.units[0];
}
if (!vizlib) {
	vizlib = conf.vizlib[0];
}
model.refreshInterval = String(refreshInterval);
model.units = String(units);
model.vizlib = String(vizlib);

var component = sitedata.getComponent(instance.object.id);
if (component) {
	model.height = component.properties["height"];
}