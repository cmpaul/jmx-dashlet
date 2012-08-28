package com.tribloom.module;

import java.util.HashMap;
import java.util.Map;

import javax.management.InstanceNotFoundException;
import javax.management.MBeanServerConnection;
import javax.management.ObjectName;
import javax.management.openmbean.CompositeData;
import javax.management.openmbean.CompositeType;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;

import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

public class JmxClient extends DeclarativeWebScript {

	// TODO: How to add a log4j logger?

	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req,
			Status status, Cache cache) {
		Map<String, Object> model = new HashMap<String, Object>();
		model.put("connectionSuccess", true);
		model.put("time", System.currentTimeMillis());
		try {
			// Create an RMI connector client and
			// connect it to the RMI connector server
			//
			echo("\nCreate an RMI connector client and "
					+ "connect it to the RMI connector server");
			JMXServiceURL url = new JMXServiceURL(
					"service:jmx:rmi://ignored/jndi/rmi://localhost:50500/alfresco/jmxrmi");
			Map<String, Object> env = new HashMap<String, Object>();
			String[] creds = {"controlRole","change_asap"};
			env.put(JMXConnector.CREDENTIALS, creds);
			JMXConnector jmxc = JMXConnectorFactory.connect(url, env);

			// Get an MBeanServerConnection
			//
			echo("\nGet an MBeanServerConnection");
			MBeanServerConnection mbsc = jmxc.getMBeanServerConnection();
			
			ObjectName memory = new ObjectName("java.lang:type=Memory");
			CompositeData heapMemUsage = (CompositeData) mbsc.getAttribute(memory, "HeapMemoryUsage");
			addCompositeData(model, heapMemUsage, "heapMemoryUsage");
			CompositeData nonHeapMemUsage = (CompositeData) mbsc.getAttribute(memory, "NonHeapMemoryUsage");
			addCompositeData(model, nonHeapMemUsage, "nonHeapMemoryUsage");
			
			ObjectName operatingSystem = new ObjectName("java.lang:type=OperatingSystem");
			model.put("openFileDescriptorCount", mbsc.getAttribute(operatingSystem, "OpenFileDescriptorCount"));
			model.put("maxFileDescriptorCount", mbsc.getAttribute(operatingSystem, "MaxFileDescriptorCount"));
			model.put("committedVirtualMemorySize", mbsc.getAttribute(operatingSystem, "CommittedVirtualMemorySize"));
			model.put("totalSwapSpaceSize", mbsc.getAttribute(operatingSystem, "TotalSwapSpaceSize"));
			model.put("freeSwapSpaceSize", mbsc.getAttribute(operatingSystem, "FreeSwapSpaceSize"));
			model.put("processCpuTime", mbsc.getAttribute(operatingSystem, "ProcessCpuTime"));
			model.put("freePhysicalMemorySize", mbsc.getAttribute(operatingSystem, "FreePhysicalMemorySize"));
			model.put("totalPhysicalMemorySize", mbsc.getAttribute(operatingSystem, "TotalPhysicalMemorySize"));
			model.put("operatingSystemName", mbsc.getAttribute(operatingSystem, "Name"));
			model.put("operatingSystemVersion", mbsc.getAttribute(operatingSystem, "Version"));
			model.put("operatingSystemArch", mbsc.getAttribute(operatingSystem, "Arch"));
			model.put("availableProcessors", mbsc.getAttribute(operatingSystem, "AvailableProcessors"));
			model.put("systemLoadAverage", mbsc.getAttribute(operatingSystem, "SystemLoadAverage"));
			
			try {
				ObjectName parNewGarbageCollector = new ObjectName("java.lang:type=GarbageCollector,name=ParNew");
				echo("\nparNewGarbageCollector = " + parNewGarbageCollector);
				CompositeData parNewLastGcInfo = (CompositeData) mbsc.getAttribute(parNewGarbageCollector, "LastGcInfo");
				addCompositeData(model, parNewLastGcInfo, "parNewLastGcInfo");
			} catch (InstanceNotFoundException ex) {
				// No Garbage Collection has occurred yet
				echo("No Garbage Collection found: " + ex.getMessage());
			}
			try {
				ObjectName concurrentGarbageCollector = new ObjectName("java.lang:type=GarbageCollector,name=ConcurrentMarkSweep");
				echo("\nconcurrentGarbageCollector = " + concurrentGarbageCollector);
				CompositeData concurrentGarbageCollectorLastGcInfo = (CompositeData) mbsc.getAttribute(concurrentGarbageCollector, "LastGcInfo");
				addCompositeData(model, concurrentGarbageCollectorLastGcInfo, "concurrentMarkSweepLastGcInfo");
			} catch (InstanceNotFoundException ex) {
				// No Garbage Collection has occurred yet
				echo("No Garbage Collection found: " + ex.getMessage());
			}

			ObjectName classLoading = new ObjectName("java.lang:type=ClassLoading");
			model.put("classLoadingLoadedClassCount", mbsc.getAttribute(classLoading, "LoadedClassCount"));
			model.put("classLoadingUnloadedClassCount", mbsc.getAttribute(classLoading, "UnloadedClassCount"));
			model.put("classLoadingTotalLoadedClassCount", mbsc.getAttribute(classLoading, "TotalLoadedClassCount"));
		
			ObjectName runtime = new ObjectName("java.lang:type=Runtime");
			model.put("runtimeName", mbsc.getAttribute(runtime, "Name"));
			model.put("runtimeClassPath", mbsc.getAttribute(runtime, "ClassPath"));
			
			// TODO: Tabular type...
			Object sysProps = mbsc.getAttribute(runtime, "SystemProperties");
			echo("\nsysProps = " + sysProps);
			
			model.put("runtimeStartTime", mbsc.getAttribute(runtime, "StartTime"));
			model.put("runtimeVmName", mbsc.getAttribute(runtime, "VmName"));
			model.put("runtimeVmVendor", mbsc.getAttribute(runtime, "VmVendor"));
			model.put("runtimeVmVersion", mbsc.getAttribute(runtime, "VmVersion"));
			model.put("runtimeLibraryPath", mbsc.getAttribute(runtime, "LibraryPath"));
			model.put("runtimeBootClassPath", mbsc.getAttribute(runtime, "BootClassPath"));
			model.put("runtimeManagementSpecVersion", mbsc.getAttribute(runtime, "ManagementSpecVersion"));
			model.put("runtimeSpecName", mbsc.getAttribute(runtime, "SpecName"));
			model.put("runtimeSpecVendor", mbsc.getAttribute(runtime, "SpecVendor"));
			model.put("runtimeSpecVersion", mbsc.getAttribute(runtime, "SpecVersion"));
			model.put("runtimeInputArguments", mbsc.getAttribute(runtime, "InputArguments")); // TODO: Array...
			model.put("runtimeUptime", mbsc.getAttribute(runtime, "Uptime"));
			
			try {
				ObjectName memoryPool = new ObjectName("java.lang:type=MemoryPool");
				model.put("memoryPoolName", mbsc.getAttribute(memoryPool, "Name"));
				model.put("memoryPoolType", mbsc.getAttribute(memoryPool, "Type"));
				CompositeData memoryPoolUsage = (CompositeData) mbsc.getAttribute(memoryPool, "Usage");
				addCompositeData(model, memoryPoolUsage, "memoryPoolUsage");
				CompositeData memoryPoolPeakUsage = (CompositeData) mbsc.getAttribute(memoryPool, "PeakUsage");
				addCompositeData(model, memoryPoolPeakUsage, "memoryPoolPeakUsage");
				model.put("memoryPoolMemoryManagerNames", mbsc.getAttribute(memoryPool, "MemoryManagerNames")); // Array of strings
				model.put("memoryPoolUsageThreshold", mbsc.getAttribute(memoryPool, "UsageThreshold"));
				model.put("memoryPoolUsageThresholdExceeded", mbsc.getAttribute(memoryPool, "UsageThresholdExceeded"));
				model.put("memoryPoolUsageThresholdCount", mbsc.getAttribute(memoryPool, "UsageThresholdCount"));
				model.put("memoryPoolUsageThresholdSupported", mbsc.getAttribute(memoryPool, "UsageThresholdSupported"));
				model.put("memoryPoolCollectionUsageThreshold", mbsc.getAttribute(memoryPool, "CollectionUsageThreshold"));
				model.put("memoryPoolCollectionUsageThresholdExceeded", mbsc.getAttribute(memoryPool, "CollectionUsageThresholdExceeded"));
				model.put("memoryPoolCollectionUsageThresholdCount", mbsc.getAttribute(memoryPool, "CollectionUsageThresholdCount"));
				CompositeData collectionUsage = (CompositeData) mbsc.getAttribute(memoryPool, "CollectionUsage");
				addCompositeData(model, collectionUsage, "memoryPoolCollectionUsage");
				model.put("memoryPoolCollectionUsageThresholdSupported", mbsc.getAttribute(memoryPool, "CollectionUsageThresholdSupported"));

			} catch (InstanceNotFoundException ex) {
				// Memory pool not initialized yet
				
			}
			
			echo("\nClose the connection to the server");
			jmxc.close();
			echo("\nBye! Bye!");
		} catch (Exception ex) {
			ex.printStackTrace();
			model.put("connectionSuccess", false);
			model.put("exception", ex.getMessage());
		}
		return model;
	}

	private void addCompositeData(Map<String, Object> model, CompositeData data, String name) {
		CompositeType type = data.getCompositeType();
		String typeName = type.getTypeName();
		echo("\naddCompositeData with type " + typeName);
		if (typeName.contains("MemoryUsage")) {
			model.put(name + "Committed", data.get("committed"));
			model.put(name + "Init", data.get("init"));
			model.put(name + "Max", data.get("max"));
			model.put(name + "Used", data.get("used"));
		} else if (typeName.contains("GcInfo")) {
			model.put(name + "Duration", data.get("duration"));
			model.put(name + "EndTime", data.get("endTime"));
			model.put(name + "StartTime", data.get("startTime"));
			model.put(name + "Id", data.get("id"));
			
//			TabularData memUsageAfterGc = (TabularData) data.get("memoryUsageAfterGc");
//			addTabularData(model, memUsageAfterGc, name + "MemoryUsageAfterGc");

//			TabularData memoryUsageBeforeGc = (TabularData) data.get("memoryUsageBeforeGc");
//			addTabularData(model, memoryUsageBeforeGc, name + "MemoryUsageBeforeGc");
		}
	}

	/* TODO: Figure out how to gracefully handle the TabularData
	private void addTabularData(Map<String, Object> model, TabularData data, String name) {
		for (Object value : data.values()) {
			ArrayList<HashMap<String, String>> gcInfo = new ArrayList<HashMap<String, String>>();
			if (value instanceof CompositeData) {
				CompositeData cd = (CompositeData) value;
				echo("\ncompositeData = " + cd);
				
				CompositeData cmsPermGen = (CompositeData) cd.get("CMS Perm Gen");
				HashMap<String, Object> cmsPermGenMap = new HashMap<String, Object>();
				addCompositeData(cmsPermGenMap, cmsPermGen, name + "CMSPermGen");
				model.put(name + "CMSPermGen", cmsPermGenMap);
				
				CompositeData codeCache = (CompositeData) cd.get("Code Cache");
				HashMap<String, Object> codeCacheMap = new HashMap<String, Object>();
				addCompositeData(codeCacheMap, codeCache, name + "CodeCache");
				model.put(name + "CodeCache", codeCacheMap);
				
				CompositeData cmsOldGen = (CompositeData) cd.get("CMS Old Gen");
				HashMap<String, Object> cmsOldGenMap = new HashMap<String, Object>();
				addCompositeData(cmsOldGenMap, cmsOldGen, name + "CMSOldGen");
				model.put(name + "CMSOldGen", cmsOldGenMap);
				
				CompositeData parEdenSpace = (CompositeData) cd.get("Par Eden Space");
				HashMap<String, Object> parEdenSpaceMap = new HashMap<String, Object>();
				addCompositeData(parEdenSpaceMap, parEdenSpace, name + "ParEdenSpace");
				model.put(name + "ParEdenSpace", parEdenSpaceMap);
				
				CompositeData parSurvivorSpace = (CompositeData) cd.get("Par Survivor Space");
				HashMap<String, Object> cmsOldGenMap = new HashMap<String, Object>();
				addCompositeData(cmsOldGenMap, cmsOldGen, name + "CMSOldGen");
				model.put(name + "CMSOldGen", cmsOldGenMap);
				
//				HashMap<String, String> row = new HashMap<String, String>();
//				row.put("committed", String.valueOf(cd.get("committed")));
//				row.put("init", String.valueOf(cd.get("init")));
//				row.put("max", String.valueOf(cd.get("max")));
//				row.put("used", String.valueOf(cd.get("used")));
//				gcInfo.add(row);
			}
//			model.put(name, gcInfo);
		}
	}
	*/

	private static void echo(String msg) {
		System.out.println(msg);
	}

}
