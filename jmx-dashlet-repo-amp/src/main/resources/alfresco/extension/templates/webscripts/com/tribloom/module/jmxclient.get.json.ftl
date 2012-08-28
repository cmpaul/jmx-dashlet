{<#if connectionSuccess?? && connectionSuccess?string == "true">
	"time" : ${time?c},<#if heapMemoryUsageCommitted??>
	"heapMemoryUsageCommitted" : ${heapMemoryUsageCommitted?c},</#if><#if heapMemoryUsageInit??>
	"heapMemoryUsageInit" : ${heapMemoryUsageInit?c},</#if><#if heapMemoryUsageMax??>
	"heapMemoryUsageMax" : ${heapMemoryUsageMax?c},</#if><#if heapMemoryUsageUsed??>
	"heapMemoryUsageUsed" : ${heapMemoryUsageUsed?c},</#if><#if nonHeapMemoryUsageCommitted??>
	"nonHeapMemoryUsageCommitted" : ${nonHeapMemoryUsageCommitted?c},</#if><#if nonHeapMemoryUsageInit??>
	"nonHeapMemoryUsageInit" : ${nonHeapMemoryUsageInit?c},</#if><#if nonHeapMemoryUsageMax??>
	"nonHeapMemoryUsageMax" : ${nonHeapMemoryUsageMax?c},</#if><#if nonHeapMemoryUsageUsed??>
	"nonHeapMemoryUsageUsed" : ${nonHeapMemoryUsageUsed?c},</#if><#if openFileDescriptorCount??>
	"openFileDescriptorCount" : ${openFileDescriptorCount?c},</#if><#if maxFileDescriptorCount??>
	"maxFileDescriptorCount" : ${maxFileDescriptorCount?c},</#if><#if committedVirtualMemorySize??>
	"committedVirtualMemorySize" : ${committedVirtualMemorySize?c},</#if><#if totalSwapSpaceSize??>
	"totalSwapSpaceSize" : ${totalSwapSpaceSize?c},</#if><#if freeSwapSpaceSize??>
	"freeSwapSpaceSize" : ${freeSwapSpaceSize?c},</#if><#if processCpuTime??>
	"processCpuTime" : ${processCpuTime?c},</#if><#if freePhysicalMemorySize??>
	"freePhysicalMemorySize" : ${freePhysicalMemorySize?c},</#if><#if totalPhysicalMemorySize??>
	"totalPhysicalMemorySize" : ${totalPhysicalMemorySize?c},</#if><#if operatingSystemName??>
	"operatingSystemName" : "${operatingSystemName}",</#if><#if operatingSystemVersion??>
	"operatingSystemVersion" : "${operatingSystemVersion}",</#if><#if operatingSystemArch??>
	"operatingSystemArch" : "${operatingSystemArch}",</#if><#if availableProcessors??>
	"availableProcessors" : ${availableProcessors?c},</#if><#if systemLoadAverage??>
	"systemLoadAverage" : ${systemLoadAverage?c},</#if><#if parNewLastGcInfoDuration??>
	"parNewLastGcInfoDuration" : ${parNewLastGcInfoDuration?c},</#if><#if parNewLastGcInfoEndTime??>
	"parNewLastGcInfoEndTime" : ${parNewLastGcInfoEndTime?c},</#if><#if parNewLastGcInfoStartTime??>
	"parNewLastGcInfoStartTime" : ${parNewLastGcInfoStartTime?c},</#if><#if parNewLastGcInfoId??>
	"parNewLastGcInfoId" : ${parNewLastGcInfoId?c},</#if><#if parNewMemoryUsageAfterGc??>
	"parNewMemoryUsageAfterGc" : [<#list parNewMemoryUsageAfterGc as gcInfo>
		{
			"committed" : ${gcInfo.committed?c},
			"init" : ${gcInfo.init?c},
			"max" : ${gcInfo.max?c},
			"used" : ${gcInfo.used?c}
		}<#if gcInfo != parNewMemoryUsageAfterGc.last>,</#if>
	</#list>]</#if><#if parNewMemoryUsageBeforeGc??>
	"parNewMemoryUsageBeforeGc" : [<#list parNewMemoryUsageBeforeGc as gcInfo>
		{
			"committed" : ${gcInfo.committed?c},
			"init" : ${gcInfo.init?c},
			"max" : ${gcInfo.max?c},
			"used" : ${gcInfo.used?c}
		}<#if gcInfo != parNewMemoryUsageBeforeGc.last>,</#if>
	</#list>]</#if><#if parNewLastGcInfoCollectionCount??>
	"parNewLastGcInfoCollectionCount" : ${parNewLastGcInfoCollectionCount?c},</#if><#if parNewLastGcInfoCollectionTime??>
	"parNewLastGcInfoCollectionTime" : ${parNewLastGcInfoCollectionTime?c},</#if><#if concurrentLastGcInfoDuration??>
	"concurrentLastGcInfoDuration" : ${concurrentLastGcInfoDuration?c},</#if><#if concurrentLastGcInfoEndTime??>
	"concurrentLastGcInfoEndTime" : ${concurrentLastGcInfoEndTime?c},</#if><#if concurrentLastGcInfoStartTime??>
	"concurrentLastGcInfoStartTime" : ${concurrentLastGcInfoStartTime?c},</#if><#if concurrentLastGcInfoId??>
	"concurrentLastGcInfoId" : ${concurrentLastGcInfoId?c},</#if><#if concurrentMemoryUsageAfterGc??>
	"concurrentMemoryUsageAfterGc" : [<#list concurrentMemoryUsageAfterGc as gcInfo>
		{
			"committed" : ${gcInfo.committed?c},
			"init" : ${gcInfo.init?c},
			"max" : ${gcInfo.max?c},
			"used" : ${gcInfo.used?c}
		}<#if gcInfo != concurrentMemoryUsageAfterGc.last>,</#if>
	</#list>]</#if><#if concurrentMemoryUsageBeforeGc??>
	"concurrentMemoryUsageBeforeGc" : [<#list concurrentMemoryUsageBeforeGc as gcInfo>
		{
			"committed" : ${gcInfo.committed?c},
			"init" : ${gcInfo.init?c},
			"max" : ${gcInfo.max?c},
			"used" : ${gcInfo.used?c}
		}<#if gcInfo != concurrentMemoryUsageBeforeGc.last>,</#if>
	</#list>]</#if><#if concurrentLastGcInfoCollectionCount??>
	"concurrentLastGcInfoCollectionCount" : ${concurrentLastGcInfoCollectionCount?c},</#if><#if concurrentLastGcInfoCollectionTime??>
	"concurrentLastGcInfoCollectionTime" : ${concurrentLastGcInfoCollectionTime?c},</#if><#if classLoadingLoadedClassCount??>
	"classLoadingLoadedClassCount" : ${classLoadingLoadedClassCount?c},</#if><#if classLoadingUnloadedClassCount??>
	"classLoadingUnloadedClassCount" : ${classLoadingUnloadedClassCount?c},</#if><#if classLoadingTotalLoadedClassCount??>
	"classLoadingTotalLoadedClassCount" : ${classLoadingTotalLoadedClassCount?c},</#if><#if runtimeName??>
	"runtimeName" : "${runtimeName}",</#if><#if runtimeClassPath??>
	"runtimeClassPath" : "${runtimeClassPath}",</#if><#if runtimeStartTime??>
	"runtimeStartTime" : ${runtimeStartTime?c},</#if><#if runtimeVmName??>
	"runtimeVmName" : "${runtimeVmName}",</#if><#if runtimeVmVendor??>
	"runtimeVmVendor" : "${runtimeVmVendor}",</#if><#if runtimeVmVersion??>
	"runtimeVmVersion" : "${runtimeVmVersion}",</#if><#if runtimeLibraryPath??>
	"runtimeLibraryPath" : "${runtimeLibraryPath}",</#if><#if runtimeBootClassPath??>
	"runtimeBootClassPath" : "${runtimeBootClassPath}",</#if><#if runtimeManagementSpecVersion??>
	"runtimeManagementSpecVersion" : "${runtimeManagementSpecVersion}",</#if><#if runtimeSpecName??>
	"runtimeSpecName" : "${runtimeSpecName}",</#if><#if runtimeSpecVendor??>
	"runtimeSpecVendor" : "${runtimeSpecVendor}",</#if><#if runtimeSpecVersion??>
	"runtimeSpecVersion" : "${runtimeSpecVersion}",</#if><#if runtimeInputArguments??><#assign i = runtimeInputArguments?size>
	"runtimeInputArguments" : [<#list runtimeInputArguments as arg>
		"${arg}"<#assign i = i - 1><#if i \gt 0>,</#if></#list>
	],</#if><#if runtimeUptime??>
	"runtimeUptime" : ${runtimeUptime?c},</#if><#if memoryPoolName??>
	"memoryPoolName" : "${memoryPoolName}",</#if><#if memoryPoolType??>
	"memoryPoolType" : "${memoryPoolType}",</#if><#if memoryPoolUsageCommitted??>
	"memoryPoolUsageCommitted" : ${memoryPoolUsageCommitted?c},</#if><#if memoryPoolUsageInit??>
	"memoryPoolUsageInit" : ${memoryPoolUsageInit?c},</#if><#if memoryPoolUsageMax??>
	"memoryPoolUsageMax" : ${memoryPoolUsageMax?c},</#if><#if memoryPoolUsageUsed??>
	"memoryPoolUsageUsed" : ${memoryPoolUsageUsed?c},</#if><#if memoryPoolPeakUsageCommitted??>
	"memoryPoolPeakUsageCommitted" : ${memoryPoolPeakUsageCommitted?c},</#if><#if memoryPoolPeakUsageInit??>
	"memoryPoolPeakUsageInit" : ${memoryPoolPeakUsageInit?c},</#if><#if memoryPoolPeakUsageMax??>
	"memoryPoolPeakUsageMax" : ${memoryPoolPeakUsageMax?c},</#if><#if memoryPoolPeakUsageUsed??>
	"memoryPoolPeakUsageUsed" : ${memoryPoolPeakUsageUsed?c},</#if><#if memoryPoolMemoryManagerNames??><#assign i = memoryPoolMemoryManagerNames?size>
	"memoryPoolMemoryManagerNames" : [<#list memoryPoolMemoryManagerNames as name>
		${name}<#assign i = i - 1><#if i \gt 0>,</#if></#list>
	],</#if><#if memoryPoolUsageThreshold??>
	"memoryPoolUsageThreshold" : ${memoryPoolUsageThreshold?c},</#if><#if memoryPoolUsageThresholdExceeded??>
	"memoryPoolUsageThresholdExceeded" : ${memoryPoolUsageThresholdExceeded},</#if><#if memoryPoolUsageThresholdCount??>
	"memoryPoolUsageThresholdCount" : ${memoryPoolUsageThresholdCount?c},</#if><#if memoryPoolUsageThresholdSupported??>
	"memoryPoolUsageThresholdSupported" : ${memoryPoolUsageThresholdSupported},</#if><#if memoryPoolCollectionUsageThreshold??>
	"memoryPoolCollectionUsageThreshold" : "${memoryPoolCollectionUsageThreshold?c}",</#if><#if memoryPoolCollectionUsageThresholdExceeded??>
	"memoryPoolCollectionUsageThresholdExceeded" : "${memoryPoolCollectionUsageThresholdExceeded}",</#if><#if memoryPoolCollectionUsageThresholdCount??>
	"memoryPoolCollectionUsageThresholdCount" : "${memoryPoolCollectionUsageThresholdCount?c}",</#if><#if memoryPoolCollectionUsageCommitted??>
	"memoryPoolCollectionUsageCommitted" : ${memoryPoolCollectionUsageCommitted?c},</#if><#if memoryPoolCollectionUsageInit??>
	"memoryPoolCollectionUsageInit" : ${memoryPoolCollectionUsageInit?c},</#if><#if memoryPoolCollectionUsageMax??>
	"memoryPoolCollectionUsageMax" : ${memoryPoolCollectionUsageMax?c},</#if><#if memoryPoolCollectionUsageUsed??>
	"memoryPoolCollectionUsageUsed" : ${memoryPoolCollectionUsageUsed?c},</#if><#if memoryPoolCollectionUsageThresholdSupported??>
	"memoryPoolCollectionUsageThresholdSupported" : "${memoryPoolCollectionUsageThresholdSupported}",</#if>
	"connectionSuccess" : true
<#else>
	"connectionSuccess" : false,
	"exception" : "<#if exception??>${exception}<#else>Unknown error occurred</#if>"
</#if>
}