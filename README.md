The FileBlock extension prevents a user from being able to access the local
file system within Firefox.

It is not 100% foolproof, but it covers most cases.

It prevents the loading of files within the browser and removes all the UI
associated with opening files.

The only way to use it is with the CCK2. Create a directory called "bundles" under the CCK2
directory. Then create a directory called fileblock in that directory.

Unzip the ZIP into that directory. (It's just a zip file.)

If you would like to allow certain files, you can modify fileBlockModule.js.

To access fileBlockService.js, unzip the XPI file using a standard zip program.

The first variable you can modify is gPathWhitelist. It specifies paths you
would like to allow. For example to allow a specific directory on Windows, it looks
like this:

```
var gPathWhitelist =  ["C:\\DIRECTORY\\SUBDIRECTORY"]
```

If you want to specify a UNC path on Windows, it looks like this:

```
var gPathWhitelist =  ["\\\\SERVER\\SHARE"]
```

You must use doubleslashes on Windows.

On Mac and Linux, you would specify a path like this:

```
var gPathWhitelist =  ["/DIRECTORY/SUBDIRECTORY"]
```

On both Mac and Windows, you can use a tilde (~) as a substitution for the user directory:
```
var gPathWhitelist = ["~/Downloads"];
```
or
```
var gPathWhitelist = ["~\\Downloads"];
```

The second variable you can modify is gExtensionWhitelist. This allows files of a specific
extension to always be opened. So for instance if you wanted to allow PDFs regardless
of their location, you could specify this:

```
var gExtensionWhitelist = ["pdf"];
```

Do not include the leading period (.) when specifying the extension name.

FileBlock is a product of Kaply Consulting. We provide other products to help you
customize Firefox like the CCK2. We also provide consulting services.

For more information, go to http://mike.kaply.com.
