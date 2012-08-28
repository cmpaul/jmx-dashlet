# jmx-dashlet #

This project builds a JMX client dashlet for Alfresco. Please note that I hacked this together over a weekend for the August 2012 Dashlet challenge, so it is a little raw and there are a lot of improvements and bug fixes I plan to make, so use at your own risk.

The dashlet is comprised of two components: a repository AMP and a Share JAR. Once deployed, they provide a dashlet that displays server information queried from a Java-based JMX client that is running as a webscript. Currently it only displays the Heap Memory Usage statistics, but I intend to add more views as I have time. 

The JMX Client assumes that your Alfresco server has an available RMI connector at localhost:50500 using the standard RMI URL, "service:jmx:rmi://ignored/jndi/rmi://localhost:50500/alfresco/jmxrmi". I may make this configurable at some point, but for now if you'd like to change this, simply modify `com.tribloom.module.JmxClient` and rebuild.

If you'd like to use the dashlet, you can either download the artifacts I've prebuilt and uploaded here to the [Downloads](https://github.com/cmpaul/jmx-dashlet/downloads) section, or you can clone/fork this repository and build them using Maven:

	jmx-dashlet-repo-amp$ mvn clean package
	jmx-dashlet-share-jar$ mvn clean package

The resulting AMP and JAR can be deployed to your Alfresco installation in the standard manner. 

If you don't have an Alfresco installation and you simply want to check the dashlet out, there is also a handy Jetty deployment goal that you can use. First copy and rename "src/test/envconfig/env.default.properties" in both projects to "env.YOUR_USER_NAME.properties" and customize it to your environment (the defaults are usually OK to use). Then start the repository server:

	jmx-dashlet-repo-amp$ mvn integration-test -P webapp

	... (build and server log output) ...

	[INFO] Started Jetty Server
	[INFO] Starting scanner at interval of 10 seconds.

Once you see the above message, you can start the Share server:

	jmx-dashlet-share-jar$ mvn integration-test -P webapp

When you see the same "Started Jetty Server" message, open a web browser and log in to Alfresco at http://localhost:8081/share.

