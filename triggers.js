// #REGION DOM TRIGGERS

// UI triggers

// Link Master table to new resources
$("body").on("click", ".btn_linkres", function(){
	isConnectingNodes = true;
	connectingFieldName = $(this).html();
	// $(this).hide();
});

// Unlink resources from Slave table 
$("body").on("click", ".btn_unlinkres", function(event){

	// ERRORE !!!! ID del nodo non è più lo stesso del indice tabelle dati
	
	// The ID of the node related to this button
	var tempID = $(this).attr("id").split("_");
	var indexID = tempID[1];
	var nodeID = "n"+indexID;
	
	//console.log("node ID to unlink:" + nodeID);
	//console.log( "Listing edges connections:");
	
	// iterate all the connections to find the one which has the target of this tooltip node
	cy.edges("[target='"+nodeID+"']").forEach(function( ele ){
		
		// remove the edge connection element
		cy.remove( ele );

		// remove the connection from memory and update local storage
		var relazioni = JSON.parse ( localStorage.getItem("mappingDatasources") );
		if(relazioni !== null)
		{
			for(var i=0;i<relazioni.modrule.length;i++)
			{
				// find the index of the connection we want to remove because involved with this node
				if(relazioni.modrule[i].destination_id === nodeID || relazioni.modrule[i].runtimelink_id === nodeID)
				{
					// remove modrule from mapping				
					mappingDatasources.modrule.splice(1,i);
					//--edgeInc; // obsoleto, riducendo l'indice delle frecce (edges) ovvero delle relazioni, si avrebbe una sovrascrittura
					// si avanz				
				}
			}
			// update local storage with updated mappingDatasources data structure
			localStorage.setItem("mappingDatasources", JSON.stringify( mappingDatasources ) );
			// notify UI 
			note.innerHTML += '<li>localStorage: mappingDatasource relations updated.</li>';
		}
		
		// disable the clicked unlink button again
		//$(event.path[1]).prop("disabled","disabled");
		var checkstr = "unlinknode_"+indexID;
		$(".btn_unlinkres").each(function()
		{
			if( $(this).attr("id") === checkstr ) $(this).prop("disabled","disabled");
		});
		
		// iterate the pulldown elements to show the hidden one related to this connection
		// OBSOLETE, now items are always available for multiple connections or standalone use
		/*var checkstr = "unlinknode_"+indexID;
		$(".btn_linkres").each(function()
		{
			if( $(this).html() === connectingFieldName ){ $(this).show();return false;}
		});*/

	});

});

// Delete runtime resource from Graph
$("body").on("click", ".btn_deleteruntimenode", function(){
	
	// The ID of the node related to this button
	var tempID = $(this).attr("id").split("_");
	var indexID = tempID[1];
	var nodeID = "nr"+indexID;
	var objStrNm = cy.$("#"+nodeID).attr("label");
	
	alert("not ready yet");
	return false;
});

// Delete resource from Graph
$("body").on("click", ".btn_deletenode", function(){

	// The ID of the node related to this button
	var tempID = $(this).attr("id").split("_");
	var indexID = tempID[1];
	var nodeID = "n"+indexID;
	var tempstr = cy.$("#"+nodeID).attr("label").split(".");
	var objStrNm = tempstr[0];
	
	//alert("not ready yet");
	//return false;
	
	if(confirm("Do you want to remove the selected node and imported data?"))
	{
		var linktoremove = cy.$("#"+nodeID);

		// delete all the connection edges involved with this node
		cy.edges("[target='"+nodeID+"']").forEach(function( ele ){
			// remove the edge connection element
			cy.remove( ele );
			edgeInc--;
		});
		// delete the node itself
		cy.remove( linktoremove );
		// update relations data structure and local storage
		var relazioni = JSON.parse ( localStorage.getItem("mappingDatasources") );
		if(relazioni !== null)
		{
			for(var i=0;i<relazioni.modrule.length;i++)
			{
				// find the index of the connection we want to remove because involved with this node
				if(relazioni.modrule[i].destination_id === nodeID || relazioni.modrule[i].runtimelink_id === nodeID)
				{
					// remove modrule from mapping				
					mappingDatasources.modrule.splice(1,i);				
				}
			}
			// update local storage with updated mappingDatasources data structure
			localStorage.setItem("mappingDatasources", JSON.stringify( mappingDatasources ) );
			// notify UI 
			note.innerHTML += '<li>localStorage: mappingDatasource relations updated.</li>';
		}
		// delete IndexedDB objectstore
		deleteDatasource(objStrNm);
	}
	else
	{
		return false;
	}
});

// Show data table for editing
$("body").on("click", ".btn_editnodedata", function(){
	$("#save_spinner").show();
	// The ID of the node related to this button
	var tempID = $(this).attr("id").split("_");
	var indexID = tempID[1];
	var nodeID = "n"+indexID;	
	var tempstr = cy.$("#"+nodeID).attr("label").split(".");
	var dataID = tempstr[0];
	$('.qtip-boostrap').qtip('hide');
	recupera_dati( dataID );
});

// Show master data table for editing
$("body").on("click", ".btn_editnodemaster", function(){
	$("#save_spinner").show();
	$('.qtip-boostrap').qtip('hide');
	recupera_dati( $(this).attr("id") );
});

$("#openpopuprss").on('click', '.testfeedbut', function() {
	
    var id = $(this).attr("id").split(/([a-zA-Z]*)([0-9\.]+)/)[2];
	var n = localStorage.getItem("openscene") - 1;
	
    if ($(this).siblings().hasClass('dynamic_rss_url')) {
		var querystring = $(this).parent().find('.dynamic_rss_url').val();
		//alert(querystring);
	   //$('select[id="selectmapping"]').val($("#selectmapping"+(id)+" option:first").val());
    }
	else
		alert("RUNTIME ERROR: no dynamic_rss_url field was defined");
		
	// make the API request
	$.getJSON("/API/v1/getFeed?f="+querystring, function(json) {
		
		if(json.data.length>0){
			console.log ( json.data[0] );
			
			if(json.data[0].TITLE !="" && json.data[0].TITLE != undefined && json.data[0].TITLE!=null)
			{
				$('select[id="dynamic_rss_key"] option:eq(0)').prop('disabled',false);
				$('select[id="dynamic_rss_key"] option:eq(0)').html("TITLE");
			}
			else $('select[id="dynamic_rss_key"] option:eq(0)').html("(TITLE) N/A");

			if(json.data[0].DESCRIPTION !="" && json.data[0].DESCRIPTION != undefined && json.data[0].DESCRIPTION != null)
			{
				$('select[id="dynamic_rss_key"] option:eq(1)').prop('disabled',false);
				$('select[id="dynamic_rss_key"] option:eq(1)').html("DESCRITPTION");
			}
			else $('select[id="dynamic_rss_key"] option:eq(1)').html("(DESCRIPTION) N/A");

			if(json.data[0].PUBDATE !="" && json.data[0].PUBDATE != undefined && json.data[0].PUBDATE != null )
			{
				$('select[id="dynamic_rss_key"] option:eq(2)').prop('disabled',false);
				$('select[id="dynamic_rss_key"] option:eq(2)').html("PUBDATE");
			}
			else $('select[id="dynamic_rss_key"] option:eq(2)').html("(PUBDATE) N/A");

			if(json.data[0].ENCLOSURE !=""  && json.data[0].ENCLOSURE != undefined && json.data[0].ENCLOSURE != null)
			{
				$('select[id="dynamic_rss_key"] option:eq(3)').prop('disabled',false);
				$('select[id="dynamic_rss_key"] option:eq(3)').html("ENCLOSURE");
			}
			else $('select[id="dynamic_rss_key"] option:eq(3)').html("(ENCLOSURE) N/A");
			
			$('select[id="dynamic_rss_index"]').prop('disabled',false);
			
			alert("TITLE:\n"+json.data[0].TITLE+"\nENCLOSURE:"+json.data[0].ENCLOSURE+"\nDESCRIPTION:"+json.data[0].DESCRIPTION+"\nPUBLICATION DATE:"+json.data[0].PUBDATE);
			$("label[id='indexkeySelectslabel']").show();
			// prepare stuff and write ext(ernal)src in the infos
			var purl = $("input[id='dynamic_rss_url']").val();
			console.log("URL:"+purl);
			url = purl.split("/");	// split url in path and resource

			var tsource = url[0]+"/"+url[1]+"/"+url[2];
			var tpath = "/"+url[3];
			for(x = 4;x<url.length;x++)
			{
				tpath += "/"+url[x];
			}
			var tkey = $('select[id="dynamic_rss_key"]').val(); // set number what field of the Item record to get from the FEED
			var tindex = $('select[id="dynamic_rss_index"]').val(); // set number of item (news) in the array to get from the FEED
	
		}
		else
		{
			console.log("No usable results found");
		}
	});
});

// OnChange del drop down menu per il formato datetime
$("#openpopuprss").on('change', '.dynamic_rss_key', function(e) {
	
	var id = $(this).attr("id").split(/([a-zA-Z]*)([0-9\.]+)/)[2];
	var n = localStorage.getItem("openscene") - 1;
	var purl = $("input[id='dynamic_rss_url"+id+"']").val();
	console.log("URL:"+purl);
	url = purl.split("/");	// split url in path and resource
	
	var tsource = url[0]+"/"+url[1]+"/"+url[2];
	var tpath = "/"+url[3];
	for(x = 4;x<url.length;x++)
	{
		tpath += "/"+url[x];
	}
	var tkey = $('select[id="dynamic_rss_key"]').val(); // set number what field of the Item record to get from the FEED
	var tindex = $('select[id="dynamic_rss_index"]').val(); // set number of item (news) in the array to get from the FEED
    
	
});

// OnChange del drop down menu per il formato datetime
$("#openpopuprss").on('change', '.dynamic_rss_index', function(e) {
	
	var n = localStorage.getItem("openscene") - 1;
		
	// prepare stuff and write ext(ernal)src in the infos
	var purl = $("input[id='dynamic_rss_url']").val();
	console.log("URL:"+purl);
	url = purl.split("/");	// split url in path and resource

	var tsource = url[0]+"/"+url[1]+"/"+url[2];
	var tpath = "/"+url[3];
	for(x = 4;x<url.length;x++)
	{
		tpath += "/"+url[x];
	}
	var tkey = $('select[id="dynamic_rss_key"]').val(); // set number what field of the Item record to get from the FEED
	var tindex = $('select[id="dynamic_rss_index"]').val(); // set number of item (news) in the array to get from the FEED

	// in case it wants an object
	/*var myObj = { "rssSource" : tsource, "rssPath" : tpath,"index" : tindex,"key" : tkey };*/
	
});

// Dynamic sources selector
$('#quicklinksmenu').on('click', '.btn_quickdynamicsource', function(e) {

	var elementid = $(this).attr("id");
	
	switch(elementid)
	{
		case "createnewrsssource":
			$("#openpopuprss").modal();
			break;
		case "createnewimagesearch":
			$("#openunsplashimagesearch").modal();
			break;
		case "createnewsource":
			$("#modalremoteapi").modal();
			break;
		default:
			// Must be a quicklink selection
			// The ID of the node related to this button
			var tempID = elementid.split("_");
			var indexID = tempID[1];
	
			// Fill remote api form controls with data structure
			/*$("#domain").val( quickLinks[indexID].domain );
			$("#path").val( quickLinks[indexID].path );
			$("#parameters").val( quickLinks[indexID].querystring );	*/
	
			// Create new entry with the resulting_url
			var labelname = quickLinks[indexID].domain.split(".");
			console.log(labelname[1]+'#'+rtNodeInc);
			
			CreateNewDynamicSource( labelname[1]+'#'+rtNodeInc, indexID );
			break;
		
	}
});

// Quick static datasource ingest selector
$('#quickstaticdatamenu').on('click', '.btn_quickstaticsource', function(e) {

	var elementid = $(this).attr("id");
	switch(elementid)
	{
		case "createnewstaticcsvsource":
			//lettura del csv e salvataggio IndexedDB con timeout per asincronia e popolamento tabella
    		$("#readfile").trigger("click");
    		return false;
			break;
		case "createnewstaticjsonsource":
			//alert("not implemented yet");
			$("#openpopupjson").modal();
			break;
		case "createnewstaticsoapsource":
			$("#openservicesoap").modal();
			break;
		case "createnewstaticimagesearch":
			$("#openunsplashimagesearch").modal();
			break;
		case "createnewstaticsource":
			$("#modalremoteapi").modal();
			break;
		case "createnewstaticrsssource":
			$("#openpopupstaticrss").modal();
			break;
			
		default:
			break;
		
	}
});

// Adding modulator rule selector
$('#ruleselector').on('click', '.btn_ruletype', function(e) {

	var elementid = $(this).attr("id");
	switch(elementid)
	{
		case "datareplacer":
			$("#ruleslist").append("<li>Replacement rule, r</li>");
			break;
		case "datamath":
			alert("not implemented yet");
			break;
		case "ruleconcatenator":
			$("#ruleslist").append("<li>Rules Concatenator</li>");
			break;
		case "resultprocessor":
			$("#ruleslist").append("<li>Result post processor</li>");
			break;
			
		default:
			break;
		
	}
});

$('#openunsplashimagesearch').on('shown.bs.modal', function () {
	$("#unsplashsearch").focus();
})

// modal event listeners
$('#openpopupdefinerelation').on('hidden.bs.modal', function (e) {
	// fai qualcosa sulla chiusura del modale "editing relazioni"
	console.log("relation modal closed, applying rules..");
	
});

$('#showdatamodal').on('shown.bs.modal', function (e) {
  // do something...
  var height = $(window).height() - 140;
  $(this).find(".modal-body").css("max-height", height);
});

// Add slideDown animation to Bootstrap dropdown when expanding.
$('.dropup').on('show.bs.dropdown', function() {
	$(this).find('.dropdown-menu').first().stop(true, true).slideDown();
});

// Add slideUp animation to Bootstrap dropdown when collapsing.
$('.dropup').on('hide.bs.dropdown', function() {
	$(this).find('.dropdown-menu').first().stop(true, true).slideUp();
});
  
// Change primary table 
$("body").on("click", ".btn_makemaster", function(){

	// The ID of the node related to this button
	var tempID = $(this).attr("id").split("_");
	var indexID = tempID[1];
	var nodeID = "n"+indexID;
	if(confirm("Are you sure you want to change the master datasource?\nThis action will reset all current connections."))
	{
		indexedDB_mastertable_name = objectStoreNames[indexID];
		localStorage.setItem("mappingMasterDataTable", indexedDB_mastertable_name);
		// TO DO: 
		// reassign the source master data table to the mod relations one by one
		// excluding the previous master datasource relation instead deleting them
		localStorage.removeItem("mappingDatasources");
		window.location.reload();
//		rebuildGraph();
	}
	else{
		return false;
	}

});

// DATA INGESTION AND SYSTEM TRIGGERS

//trigger per generare il file mastro
$("#tpl_btn").click (function(){
   var dlink = document.createElement('a');
        dlink.download = localStorage.getItem("prj_id")+'.xlsx';
        dlink.href = '/API/v1/getMasterCSV/'+localStorage.getItem("prj_id");
        dlink.click();
        dlink.remove();
});

$("#privateapitoggle").change(function() {
	if ( $(this).prop("checked") )
		$("#privateapiblock").slideDown("fast"); //removeClass("nodisp");
	else
		$("#privateapiblock").slideUp("fast"); //addClass("nodisp");
});

$("#protocolprefix,#domain,#path,#parameters").change(function(){
	updateResultingUrl();
})
$("#domain,#path,#parameters").keyup(function(){
	updateResultingUrl();
})
function updateResultingUrl(){
	// add a leading SLASH / if none is found at the start of the PATH string
	var leadslash = "/";
	var leadqm = "?";
	if( $("#path").val().substring(0,1)=="/") leadslash="";
	if( $("#parameters").val().substring(0,1)=="?") leadqm="";
	var compstr = $("#protocolprefix").val() + $("#domain").val() +leadslash+ $("#path").val() +leadqm+ $("#parameters").val();
	$("#resulting_url").html(compstr);
}

// intercept tree view UL elements clicks
$(".json-view ul").on('click', function(event){
	alert("you have clicked the "+event.innerHTML+" node");
});

// Json array objects in jSonView
$("#jsontreeblock").on('click', '.selectableobj', function(e) {
	//alert("you have clicked the "+e.target.innerHTML+" node");
	tmp_path = "";
	ouccurance_found = false;
	// Get the target object
    getSmartPath(jsonObj, e.target.id, function(target,object){
        // Get the path and display it
        //$('div#path').html('root/' + getPath(target, ''));
        //path = getFlatObject(target);
        //$("#datapathinfo").val("Root/"+ path);
        
        $("#datapathinfo").val("Root/"+ target);
		
		// to do:
		// json ALASQL importer
	 	alasql.options.valueof = false;
		alasql('CREATE INDEXEDDB DATABASE IF NOT EXISTS '+indexedDB_database+';\
			ATTACH INDEXEDDB DATABASE '+indexedDB_database+'; \
			USE '+indexedDB_database+'; \
			DROP TABLE IF EXISTS '+indexedDB_prefix+'; \
			CREATE TABLE '+indexedDB_prefix+'; \
			SELECT * INTO '+indexedDB_prefix+' FROM ?', [object], function(){
				recupera("json");
		});
    });
	
	//$("#datapathinfo").val("jsonData/"+e.target.innerHTML);
});

// Remote API data returned in json in jSonView
$("#jsontreeblock_api").on('click', '.selectableobj', function(e) {
	
	if(jsonIsClickable){
			
		//alert("you have clicked the "+e.target.innerHTML+" node");
		tmp_path = "";
		ouccurance_found = false;
		
		if(e.target.id=="jsonobjapi") // is Root object
		{
			 $("#datapathinfo_api").val("jsonobjapi/");
			
			// to do:
			// json ALASQL importer
			alasql.options.valueof = false;
			alasql('CREATE INDEXEDDB DATABASE IF NOT EXISTS '+indexedDB_database+';\
				ATTACH INDEXEDDB DATABASE '+indexedDB_database+'; \
				USE '+indexedDB_database+'; \
				DROP TABLE IF EXISTS '+indexedDB_prefix+'; \
				CREATE TABLE '+indexedDB_prefix+'; \
				SELECT * INTO '+indexedDB_prefix+' FROM ?', [jsonobjapi], function(){
					recupera("remoteapi");
			});
		}
		else
		{
			// Get the target object and set path
			//var testobjectfind = search(jsonobjapi, e.target.id);
			//console.log("object: "+testobjectfind);
			
			//res2 = jsonPath(o, "$..author", {resultType:"PATH"}).toJSONString();
			
			var res=search(jsonobjapi, function(key,value){
				return key === e.target.id;
			});
			console.log(res);
			
			getSmartPath(jsonobjapi, e.target.id, function(target,object){
			// Get the path and display it
			//$('div#path').html('root/' + getPath(target, ''));
			//path = getFlatObject(target);
			//$("#datapathinfo").val("Root/"+ path);
			
			$("#datapathinfo_api").val("jsonobjectapi/"+ target);
			
			// to do:
			// json ALASQL importer
			alasql.options.valueof = false;
			alasql('CREATE INDEXEDDB DATABASE IF NOT EXISTS '+indexedDB_database+';\
				ATTACH INDEXEDDB DATABASE '+indexedDB_database+'; \
				USE '+indexedDB_database+'; \
				DROP TABLE IF EXISTS '+indexedDB_prefix+'; \
				CREATE TABLE '+indexedDB_prefix+'; \
				SELECT * INTO '+indexedDB_prefix+' FROM ?', [object], function(){
					recupera("remoteapi");
				});
			});
		
			//$("#datapathinfo").val("jsonData/"+e.target.innerHTML);
		
		}
	}
});

//trigger per eliminare valore csv
$("#readfile").click(function() {
    this.value = null;
});
$("#readfilejson").click(function() {
    this.value = null;
});

// Parse del JSON inserito nel box di testo
$("#btnparsejson").click(function(){
	
   	// empty any previous created tree view
    $("#jsontreeblock").empty();
	
	// parse text area for json
	jsonObj = JSON.parse( $("#textjsonarea").val() );		//console.log(jsonObj);
	
	// create treeview from new data        
	$("#jsontreeblock").jsonView({
		jsonObj
	});
});
// Upload di un file json
$("#btnuploadjson").click(function() {
    $("#readfilejson").trigger("click");
    return false;
});
// Download RSS Feed 
$("#btndownloadrss").click(function(){
	
	var querystring = $("#rssfeedurl").val();
	$("#save_spinner").show();
	
	$.getJSON("/API/v1/getFeed?f="+querystring, function(json) {
		
		if(json.data.length>0){
			alasql.options.valueof = false;
			// Create IndexdDB database and fill it with data from array
			alasql('CREATE INDEXEDDB DATABASE IF NOT EXISTS '+indexedDB_database+';\
				ATTACH INDEXEDDB DATABASE '+indexedDB_database+'; \
				USE '+indexedDB_database+'; \
				DROP TABLE IF EXISTS '+indexedDB_prefix+'; \
				CREATE TABLE '+indexedDB_prefix+'; \
				SELECT * INTO '+indexedDB_prefix+' FROM ?', [json.data], function(){

				// Select data from IndexedDB
				//alasql.promise('SELECT COLUMN * FROM cities WHERE population > 100000 ORDER BY city DESC')
				//	.then(function(res){
				//		document.write('Sole24 news: ', res.join(','));
				//	});
					$("#openpopupstaticrss").modal('hide');
					recupera("RSS");
				});
			
			//alasql('SELECT [*] INTO '+indexedDB_prefix+' FROM JSON(?); SELECT VALUE COUNT(*) FROM '+indexedDB_prefix, [json] );
		}
		else
		{
			console.log("No usable results found");
		}
		
		
	});
});

// Download remote API data 
$("#btndownload_data").click(function(){
	
	var remoteapistring = $("#resulting_url").html();
	remoteapistring = remoteapistring.replace(/&amp;/g, "&");
	
	$("#save_spinner").show();	
	
	$.getJSON(remoteapistring, function(data) {
		jsonobjapi = JSON.parse(JSON.stringify(data) );	
		console.log(jsonobjapi);
		if(jsonobjapi.length>0 || jsonobjapi!=null) {

			// empty any previous created tree view
			$("#jsontreeblock_api").empty();
			// create from new data        
			$("#jsontreeblock_api").jsonView({
				jsonobjapi
			});
		
			$("#save_spinner").hide();
			$("#data_result_section").slideDown("fast");
			
			if(jsonobjapi.length>0 ) jsonobjapi_isobject = true;

			// write down a new quick link recent entry:			
			const qlink =
			{
				"domain" : $("#domain").val(),
				"path" : $("#path").val(),
				"querystring": $("#parameters").val()
			}
			
			//localStorage.setItem("quicklink_"+quickLinkIndex, JSON.stringify(valore));
			localStorage["quicklink_"+quickLinkIndex] = JSON.stringify(qlink);
			
			// populate the corresponding array
			quickLinks.push(qlink);
			
			//$("#quicklinkslist").append("<li><button id='quicklinkbut_"+quickLinkIndex+"' class='btn btn_standard btn-xs btn_filldata'>"+quickLinks[quickLinkIndex].domain+"</button></li>");
			$("#quicklinkslist").append("<li><button id='quicklinkbut_"+quickLinkIndex+"' class='btn_standard btn-xs btn_filldata'>"+quickLinks[quickLinkIndex].domain+"</button><button class='btn-xs btn_standard btn_deletequicklink' title='delete this quick link'>-</button></li>");
			$("#quicklinksheader").after("<li><button id='quicklinkbut_"+quickLinkIndex+"' class='btn_standard btn_quickdynamicsource'>"+quickLinks[quickLinkIndex].domain+"</button></li>");
			
			//increase quick link index
			quickLinkIndex++;
			if(quickLinkIndex > (maxNumSavedQuickLinks-1) ) quickLinkIndex = 0;

		}
		else
		{
			console.log("No usable results found");
		}
		
	});
});

// download WEBSIM API data 
$("#ingest_btn").click(function(){
	
	if( $("#isincode").val() == ""){
		alert("ISIN code is mandatory!");
		return false;
	}	
	var babuvar = $('input[name=babuplong]:checked').val();
	var remoteapistring = "/API/websim_newsletter.php?isin_code="+$("#isincode").val()+"&babuplong="+babuvar;
	
	// additional options (date, last)
	if( !$("#lastonly").prop("checked") ){
		remoteapistring = remoteapistring + "&last_only=false&data_inizio="+$("#datainizio")+"&data_fine="+$("#datafine").val();
	}
	
	$("#save_spinner").show();
	$.getJSON(remoteapistring, function(data) {
		
		var websim_raw = JSON.stringify(data);
		websim_api = JSON.parse(websim_raw);
		
		var values = Object.keys(websim_api).map(function(k) { return websim_api[k] });
		var keys = Object.keys(websim_api);
		var fields = JSON.stringify(keys);
		fields = fields.replace("[","");
		fields = fields.replace("]","");
		fields = fields.replace(/["']/g,"");
		fields = fields.replace(/[,]/g," STRING,");
		fields += " STRING";

		console.log(websim_api);

		if(websim_api.length>0 || websim_api!=null) {

			// empty any previous created tree view
			$("#jsontreeblock_websim").empty();
			//$("#jsontreeblock_websim").html( JSON.stringify(data) );
			// create from new data        
			$("#jsontreeblock_websim").jsonView({
				websim_api
			});
			
			alasql.options.valueof = false;		
			alasql('CREATE INDEXEDDB DATABASE IF NOT EXISTS '+indexedDB_database+';\
				ATTACH INDEXEDDB DATABASE '+indexedDB_database+'; \
				USE '+indexedDB_database+'; \
				DROP TABLE IF EXISTS '+indexedDB_prefix+'; \
				CREATE TABLE '+indexedDB_prefix+'('+fields+'); \
				INSERT INTO '+indexedDB_prefix+' VALUES @'+websim_raw+';', function(){
					recupera("remoteapi");
					//recupera_websim(websim_api);
				});
			$("#websim_data_result_section").slideDown("fast");
		}
		else
		{
			console.log("No usable results found");
		}
		
	});
});

$("#quicklinkslist").on('click', '.btn_filldata', function(e) {

	// The ID of the node related to this button
	var tempID = $(this).attr("id").split("_");
	var indexID = tempID[1];
	
	// Fill remote api form controls with data structure
	$("#domain").val( quickLinks[indexID].domain );
	$("#path").val( quickLinks[indexID].path );
	$("#parameters").val( quickLinks[indexID].querystring );	
	
	// Update resuling_turl control
	updateResultingUrl();
	
});

// clear the whole list of quick links from the DOM from the localStorage and from the memory
$("#clearlist_button").click(function() {
	if(confirm("This action will delete the whole quick links list, ARE YOU SURE ?"))
	{
		quickLinks = [];
		quickLinkIndex = 0;
		$("#quicklinkslist").html('<ul id="quicklinkslist"></ul>');
		for(var i=0;i<maxNumSavedQuickLinks;i++){
			localStorage.removeItem("quicklink_"+i);
		}
	}		
});

// delete the single entry from the DOM and from the memory and re-write the localStorage
$("#quicklinkslist").on('click', '.btn_deletequicklink', function(e) {
	//	$(this).parent.
	// TO DO
	alert("not implemented yet");
});


//trigger per passare a mapping.html
$("#map_btn").click(function(){
   if (localStorage.getItem("empty") === null){
       location.href = "/module/mapping/";
   } else{      alert("Select a valid datasource first");
        return;  
    }
});

//download PNG dello schema
$("#export_schema_png").click(function() {
	
	const options =
	{
		"bg": "#446a99",
	};
	var png64 = cy.png( options	);
	$('#downloadPNG').attr('src', png64); 
	$('#downloadPNG').show();
	//location.href = png64;
});

// reset dello schema e cancellazione dati
$("#delete_all_datasources").click(function(){
if(confirm("are you sure to delete all the imported datasource for this project ?"))
{
	ResetSchema();
}
else
{
	return;
}

});

// unsplash search module
$('#unsplashsearch').on('keyup', function() {
	var html = "";
	
	var search = $(this).val();
	delay(function(){
		$.getJSON("/API/unsplash.php?search="+search, function(json) {
			if(json.length>0){
				//html = '<img class="thumbnail" data-id="'+json[0]['urls']['regular']+'" data-type="BG-IMG" data-src="'+json[0]['urls']['small']+'" src="'+json[0]['urls']['small']+'" alt="first occurrance in searching: '+search+'" >';
				for(var k in json) {
						html +=	'<img class="thumbnail" data-id="'+json[k]['urls']['regular']+'" data-type="BG-IMG" data-src="'+json[k]['urls']['small']+'" src="'+json[k]['urls']['small']+'" alt="first occurrance in searching: '+search+'" >';
				}
			}
			else
			{
				html = "<h4>No results found with the keyword: <i>"+search+"</i></h4>";
			}
			$("#img_result_section").html( html );
			$("#imagepreviewframe").attr('src', json[0]['urls']['small'] );
			$("#imagepreviewframe").show();
			$("#img_result_section").slideDown();
			//refreshStageCarousel(html);
		});
	}, 2000 );
});

$("body").on("click", ".thumbnail", function(){
	$("#imagepreviewframe").attr('src', $(this).attr('data-src') );
});

// antico bottone per tornare ad antico modulo (obsolete)
$("#back_to_data_ingest").click(function(){
if(confirm("Pressing OK will return to data-ingest module"))
	location.href = "/module/csv/";
else
	return;
});
