
// fill the Add Source button drop up menu
function RecuperaQuickLinkSalvati()
{
	for(var i=0;i<maxNumSavedQuickLinks;i++){
		if( localStorage["quicklink_"+i] === undefined )
		{
			quickLinkIndex = i;
			break;
		}
		else
		{
			quickLinks.push( JSON.parse( localStorage["quicklink_"+i]) );
			$("#quicklinkslist").append("<li><button id='quicklinkbut_"+i+"' class='btn_standard btn-xs btn_filldata'>"+quickLinks[i].domain+"</button><button class='btn-xs btn_standard btn_deletequicklink' title='delete this quick link'>-</button></li>");
			$("#quicklinksheader").after("<li><button id='quicklinkbut_"+i+"' class='btn_standard btn_quickdynamicsource'>"+quickLinks[i].domain+"</button></li>");
		}
	}
}

// Crea i nodi dai RuntimeLinks
function RigeneraNodiRealtime(){
	
	// TO DO: Raggruppare tutti i runtimeLinks sotto un unica struttura runtimeLinks per semplicità
	// Nota: per ora in alternativa vario il codice per iterare l'indice
	var nid; // realtime node index
	var targetNode;
	var labelname;
	
	for(nid=0;nid<99;nid++)
	{
		var rtlink = null;
		var lsobj = localStorage["runtimeLink_"+nid];
		if (lsobj!==null && lsobj!== undefined) rtlink = JSON.parse ( lsobj ); else continue;
//		console.log("checking node id"+(rtNodeInc+nid)+" runtimeLink_"+nid );

		if(rtlink !== null){
			targetNode = "nr"+rtNodeInc;
			
			// push the realtime data structure
			runtimeLink = new RuntimeLink();
			
			var parametersDOM = '<strong>Parameters:</strong>';
			for (let [key, value] of Object.entries(rtlink.parameters)) {
				console.log(key, value);
				parametersDOM += '<ul><li><strong>'+key+':</strong>'+value+'</li></ul>';
			}
			parametersDOM += '<hr>';
			runtimeLink.set( 
				rtlink.label,
				rtlink.domain,
				rtlink.path,
				rtlink.parameters,
				rtlink.jsonpath
			);
			
			var labelsplit = rtlink.domain.split(".");
			labelname = labelsplit[1]+'#'+rtNodeInc;
			
			// populate the corresponding array
			runtimeLinks.push(runtimeLink);

			// Add a runtimeLink node
			var eles = cy.add([
				{ group: "nodes", data: { id: targetNode, label: labelname }, 
				position: { x: 100+(nid*100), y: 300,} }
			]);
			
			var imageUrl = 'https://dev.littlesea.tv/modules/csv/images/remote_api.png';
			cy.$("#"+targetNode).style({
				'background-image': imageUrl,
				'background-fit': 'contain',
				'background-color': '#161f3a',
				'background-opacity': 0.75,
				'border-color': 'white',
				'border-width': 3,
				'border-opacity': 0.85,
				'shape': 'concavehexagon'
			});
			tipDomChunk = '<br><span style="font-size:11px;color:#161f3a;"><strong>Domain:</strong>'+runtimeLink.domain+'<br>\n\
			<strong>Path:</strong>'+runtimeLink.path+'<br>'+parametersDOM+'\n\
			<strong>JSON object path:</strong>'+runtimeLink.jsonpath+'</span><br><br>\n\
			<button id="editnode_'+rtNodeInc+'" class="btn_displaynodedata btn-primary" title="show data"><i class="fa fa-eye" style="font-size:14px;color:#161f3a;"></i></button>\n\
			<button id="deletenode_'+rtNodeInc+'" class="btn_deleteruntimenode btn-primary" title="delete node"><i class="fa fa-trash-o" style="font-size:14px;color:#161f3a;"></i></button>\n\
			<button id="unlinknode_'+rtNodeInc+'" class="btn_unlinkres btn-primary" title="unlink node"><i class="fa fa-chain-broken" style="font-size:14px;color:#161f3a;"></i></button>';
			
					
			cy.$("#"+targetNode).qtip({
			  content: '<label style="font-size:13px;color:#161f3a;">[runtime_'+rtNodeInc+'].remoteapi</label>'+tipDomChunk,
			  position: {
				my: 'top center',
				at: 'bottom center'
			  },
			  style: {
				classes: 'qtip-blue qtip-shadow qtip-rounded qtip-boostrap',
				tip: {
					border: 2,
					width: 16,
					height: 8
				}
			  }
			});
			rtNodeInc++;
		}
	}
	console.log("next node id"+rtNodeInc);
	cy.style().update();
	mlayout.run();
}

// Rigenera le relazioni salvate su disco
function RigeneraRelazioni(){
	
	var relazioni = JSON.parse ( localStorage.getItem("mappingDatasources") );
	var destinazione;
	var id_destinazione;
	
	if(relazioni === null) return false;
	
	for(var i=0;i<relazioni.modrule.length;i++)
	{
		var _this_modulationrule = new ModulationRule();
		destinazione = relazioni.modrule[i].destination_id;
		// first, estabilish if the destination is a static or runtime datasource
		if(destinazione.split('#').count > 1)
		{
			// è una relazione verso una sorgente runtimeù
			
		}
		
		// push the modulation rule into the stack
		_this_modulationrule.set( relazioni.modrule[i].source_id, relazioni.modrule[i].destination_id, relazioni.modrule[i].source_key);
		mappingDatasources.push( _this_modulationrule );
		
		// find node ID given the label string
		cy.nodes("[label='"+destinazione+"']").forEach(function( ele ){
			id_destinazione = ele.data().id;
		});
		
		// Add a connection edge between the nodes
		++edgeInc;
		var elem = cy.add([
			{ group: "edges", data: { id: "e"+edgeInc, source: "masterTable", target: id_destinazione } }
		]);
		
		
 
		// Restore the Master "connect" dropwdown items that are already involved in a relation
		/*
		var indexID = relazioni.modrule[i].destination_id.substr(1, relazioni.modrule[i].destination_id.length-1);
		var checkstr = "unlinknode_"+indexID;
		
		// enable unlink button on node tooltip
		$(".btn_unlinkres").each(function()
		{
			if( $(this).attr("id") === checkstr )
				$(this).prop("disabled",false);
		});
		*/
	}
}

// Aggiunge un nuovo nodo "runtime" allo schema
function CreateNewDynamicSource(labelname, qlid)
{	
	var targetNode = "nr"+rtNodeInc;
	console.log("NEW Runtime NODE ID:"+targetNode);

	// Create realtime data structure
	runtimeLink = new RuntimeLink();
	
	// remove the trailing ? from querystring
	var qs = quickLinks[qlid].querystring;
	var parameterstr = qs.substr(1,qs.length-1);
	var entries = parameterstr.split("&");
	var parameters = {};
	var parametersDOM = '<strong>Parameters:</strong>';
		
	for(var p=0;p<entries.length;p++)
	{
		var key = decodeURIComponent(decodeURIComponent( entries[p].split("=")[0] ));
		var val = decodeURIComponent(decodeURIComponent( entries[p].split("=")[1] ));
		parameters[ key ] = val;
		parametersDOM += '<ul><li><strong>'+key+':</strong>'+val+'</li></ul>';
	}
	parametersDOM += '<hr>';
	
	runtimeLink.set( 
		quickLinks[qlid].domain,
		quickLinks[qlid].path,
		parameters,
		quickLinks[qlid].jsonpath
	);
	localStorage["runtimeLink_"+rtNodeInc] = JSON.stringify(runtimeLink);
	
	// populate the corresponding array
	runtimeLinks.push(runtimeLink);
	
	var eles = cy.add([
		{ group: "nodes", data: { id: targetNode, label: labelname }, 
		position: { x: 100+(rtNodeInc*100), y: 300-rtNodeInc*Math.sin(80),} }
	]);
	
	var imageUrl = 'https://dev.littlesea.tv/modules/csv/images/remote_api.png';
	cy.$("#"+targetNode).style({
		'background-image': imageUrl,
		'background-fit': 'contain',
		'background-color': '#161f3a',
		'background-opacity': 0.75,
		'border-color': 'white',
		'border-width': 3,
		'border-opacity': 0.85,
		'shape': 'concavehexagon'
	});
	cy.style().update();
		
	tipDomChunk = '<br><span style="font-size:11px;color:#161f3a;"><strong>Domain:</strong>'+runtimeLink.domain+'<br><strong>Path:</strong>'+runtimeLink.path+'<br>'+parametersDOM+'\n\
	<strong>JSON object path:</strong>'+runtimeLink.jsonpath+'</span><br><br>\n\
	<button id="editnode_'+rtNodeInc+'" class="btn_displaynodedata btn-primary" title="show data"><i class="fa fa-eye" style="font-size:14px;color:#161f3a;"></i></button>\n\
	<button id="deletenode_'+rtNodeInc+'" class="btn_deleteruntimenode btn-primary" title="delete node"><i class="fa fa-trash-o" style="font-size:14px;color:#161f3a;"></i></button>\n\
	<button id="unlinknode_'+rtNodeInc+'" class="btn_unlinkres btn-primary" title="unlink node"><i class="fa fa-chain-broken" style="font-size:14px;color:#161f3a;"></i></button>';
	
	cy.$("#"+targetNode).qtip({
	  content: '<label style="font-size:13px;color:#161f3a;">[runtime_'+rtNodeInc+'].remoteapi</label>'+tipDomChunk,
	  position: {
		my: 'top center',
		at: 'bottom center'
	  },
	  style: {
		classes: 'qtip-blue qtip-shadow qtip-rounded qtip-boostrap',
		tip: {
			border: 2,
			width: 16,
			height: 8
		}
	  }
	});
	
	++rtNodeInc;
	mlayout.run();
}

function ResetSchema(){
	
	localStorage.removeItem("mappingIndex");
	localStorage.removeItem("mappingDatasources");
	
	// clean out individual related localStorage mappingDatasources relations and runtimeLink variables
	for(var i=0;i<99;i++){
		localStorage.removeItem("mappingFieldsNum_dati_"+i);
		localStorage.removeItem("mappingRecordsNum_dati_"+i);
		localStorage.removeItem("mappingSourceType_dati_"+i);
		localStorage.removeItem("runtimeLink_"+i);
	}
		
	var req = indexedDB.deleteDatabase(indexedDB_database);
	console.log('deleting: '+indexedDB_database+' DB');
	
	req.onsuccess = function() {
		console.log("deleted success, fully cleared");
		window.location.reload();
	};
	req.onerror = function() {
		console.log("Couldn't delete database");
	};	
	req.onblocked = function() {
		console.log("Couldn't delete database due to the operation being blocked");
	};
	
}

//salvataggio classe mappingDatasources
function savemapping(){
    console.log("videoMap before STRINGIFY:"+videoMap);
    var arr = JSON.stringify(videoMap);
    console.log("videoMap after STRINGIFY:"+arr);
    // TO DO, solve the associative array/object for .data for RSS mapping in mapping_trigger.js    
    if(arr.length !== 80){
    	localStorage.setItem("videomap",arr);
    }  
}

/**
* @param {string} store_name
* @param {string} mode either "readonly" or "readwrite"\\
*/
function getObjectStore(store_name, mode) {
	var tx = db.transaction(store_name, mode);
	return tx.objectStore(store_name);
}

function clearObjectStore(DB_STORE_NAME) {
    $("#save_spinner").show();
    var request = indexedDB.open(indexedDB_database);
	request.onerror = function(event) {
	  alert("La mia app non ha il permesso di usare IndexedDb");
	};
	
	request.onsuccess = function(event) {
		db = this.result;
		note.innerHTML += '<li>Request successful.</li>';
		
		var store = getObjectStore(DB_STORE_NAME, 'readwrite');
		
		
		var req = store.clear();
		req.onsuccess = function(evt) {
		  console.log(DB_STORE_NAME+" objectStore cleared");
		  $("#save_spinner").hide();
		};
		req.onerror = function (evt) {
		  console.error("clearObjectStore:", evt.target.errorCode);
		};
	};
 }

// Delete individually an ObjectStore from the IndexedDB
function deleteDatasource(objectName) {
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	
	//var objectName = indexedDB_tablename+"_"+datasourceindex;
	 
	if (!window.indexedDB) {
	   window.alert("Your browser doesn't support a stable version of IndexedDB.")
	}
	else
	{
	    $("#save_spinner").show();
   		versionInc = dbversion+1;
		var request = indexedDB.open(indexedDB_database,versionInc);
		
		request.onerror = function(event) {
		  alert("My webapp is not allowed to access IndexedDB");
		  request.result.close();
		};
		
		request.onsuccess = function(event) {
			//db = this.result;
			//db = event.target.result;
			note.innerHTML += '<li>Request successful.</li>';
			request.result.close();
		};
			
		request.onupgradeneeded = function(e) {
	
			var db = event.target.result;
			
			db.onerror = function(event) {
			  note.innerHTML += '<li>Error loading database.</li>';
			};

			//var db2 = request2.result;
			console.log("IndexedDB old version:" +e.oldVersion + " new version:"+e.newVersion );
			db.deleteObjectStore( objectName );

			// update localstorage variables to reflect the new schema
			var oldNumOfObjects = localStorage.getItem("mappingIndex");
			mappingIndex = oldNumOfObjects-1;
			localStorage.setItem("mappingIndex", mappingIndex);
		
			localStorage.removeItem("mappingRecordsNum_"+objectName);
			localStorage.removeItem("mappingFieldsNum_"+objectName);
			localStorage.removeItem("mappingSourceType_"+objectName);
		
			note.innerHTML += '<li>object store: dati_'+objectName+' deleted successfully.</li>';
			++dbversion;
			$("#save_spinner").hide();
			
		};
	
		request.onblocked = function(e){
			note.innerHTML += '<li>errore: database bloccato.</li>';
			request.result.close();
		};
		
	}

}

// json manipulation related functions
function processFile(theFile){
  return function(e) { 
    var theBytes = e.target.result; //.split('base64,')[1];
	jsonObj = JSON.parse(theBytes);
	
	$("#textjsonarea").html(JSON.stringify(jsonObj, undefined, 2));
		
    // empty any previous created tree view
    $("#jsontreeblock").empty();
	
	// create from new data        
	$("#jsontreeblock").jsonView({
		jsonObj
	});
	
	// This sub leafs of the object will be taken by the data-scientist (user) with the new interface
	//jsonData = jsonObj.meta.view.columns; //.view.columns;
	//jsonData = jsonObj.data.categories;
	//jsonData = jsonObj.data; //other json
	//jsonData = jsonObj.query.results.channel; yahoo weather
  }
}

var loadFileJson = function(event){
	var filename = $("#readfilejson").val();
	var oggetto = document.getElementById("readfilejson");
    
	var extension = filename.replace(/^.*\./, '');
    if (extension !== "json" ) {
        alert("Unsupported file extension. Please upload only json format");
        return;
    }
	
	//$("#pastejsonarea").hide();
	
    $("#save_spinner").show();
	var reader = new FileReader();
	var files = oggetto.files[0];
	reader.onload = processFile(files);
	
	// start reading a loaded file
	reader.readAsText(files);
	
	$("#save_spinner").hide();
}

// The get object function
var getObject = function(container, id, callback) {
    //$.each(container, function(item) {
    Object.keys(container).forEach(function(item){
    	
    	if(item === id) {callback(container[item]);}
        else if( Array.isArray(container[item])) {
        		for(var i=0;i<container[item].length;i++){
        			if(container[item][i] === id) {callback(container[item][i]);}
        			else getObject(container[item][i], id, callback);
        		}
        	}
    	console.log(item + ' - ' + container[item]);
	});

	/*
    for(var item in container) {
        if(item === id) {callback(item);
	        return;return;}
        else if( Array.isArray(container[item])) {
        		for(var i=0;i<container[item].length;i++){
        			getObject(container[item][i], id, callback);
        		}
        	}
        	//else
        	//	getObject(container[item], id, callback);
    };*/
};

// Try to build the path and find the occurance of the selected leaf node, and returns it to the callback
var getSmartPath = function(container, id, callback) {
    //$.each(container, function(item) {
    Object.keys(container).forEach(function(item){
		if(!ouccurance_found)
		{
			if(item === id) {
				ouccurance_found=true;
				tmp_path += item+"/";
				callback(tmp_path,container[item]);
				return;
			}
			else if( container[item] != null || container[item] != undefined)
			{
				if( Array.isArray(container[item]) ) {
	//				if(container[item].length>0) tmp_path += item+"/";
					for(var i=0;i<container[item].length;i++){
						if(item === id){
							ouccurance_found=true;
							tmp_path += item+"/";
							callback(tmp_path, container[item][i]);
							return;
						}
						else getSmartPath(container[item][i], id, callback);
						console.log(item + ' - ' + container[item][i]);
					}
				}
				else if (Array.isArray(container[item][id]) )
				{
					tmp_path += item+"/"+id+"/";
					ouccurance_found=true;
					callback(tmp_path, container[item][id]);
					return;
				}
			}			
		}
	});
};

function search(obj, predicate) {
	let result = []; 
	for(let p in obj) { // iterate on every property
	  // tip: here is a good idea to check for hasOwnProperty
	  //console.log(p.hasOwnProperty);
	  if (typeof(obj[p]) == 'object') { // if its object - lets search inside it
		  result = result.concat(search(obj[p], predicate));
	  } else if (predicate(p, obj[p])) 
		  result.push(
			 obj
		  ); // check condition
	}
	return result;
 }
 
/*
  var result = search(json, function(key, value) { // im looking for this key value pair
      return key === 'nm' && value.indexOf("STATIC-IMAGE") !== -1;
  });
  result.forEach(r => console.log(r))
*/

// Get path of an object
var getPath = function(target, path) {
    if( target.parent ) {
        path = target.parent.name + '/' + path;
        return getPath(target.parent, path);
    }
    else return path;
};

function getFlatObject(object) {
    function iter(o, p) {
        if (Array.isArray(o) ){
            o.forEach(function (a, i) {
                iter(a, p.concat(i));
            });
            return;
        }
        if (o !== null && typeof o === 'object') {
            Object.keys(o).forEach(function (k) {
                iter(o[k], p.concat(k));
            });
            return;
        }
        path[p.join('.')] = o;
    }

    var path = {};
    iter(object, []);
    return path;
}

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

function Cytoscape_Setup()
{
	cy = cytoscape({

		container: document.getElementById('cy'),

		boxSelectionEnabled: false,
		autounselectify: false,
		maxZoom: 1.0,
		minZoom: 0.7,
		// interaction options:
		zoomingEnabled: true,
		userZoomingEnabled: true,
		panningEnabled: true,
		userPanningEnabled: true,
		boxSelectionEnabled: false,
		selectionType: 'single',
		touchTapThreshold: 8,
		desktopTapThreshold: 4,
		autolock: false,
		autoungrabify: false,

		// rendering options:
		headless: false,
		styleEnabled: true,
		hideEdgesOnViewport: false,
		hideLabelsOnViewport: false,
		textureOnViewport: false,
		motionBlur: true,
		motionBlurOpacity: 0.2,
		wheelSensitivity: 0.05,
		pixelRatio: 'auto',

		style: [
			{
			  selector: 'node', 
			  style: {
				'shape': 'barrel',
				'content': 'data(label)',
				'height': 90,
				'width': 80,
				'background-fit': 'contain',
				'background-color': '#161f3a',
				'border-color': '#046',
				'border-width': 3,
				'border-opacity': 0.5
			  }
			},
			{
			  selector: 'edge',
			  style: {
				'curve-style': 'bezier',
				'width': 5,
				'target-arrow-shape': 'triangle',
				'line-color': '#224477',
				'target-arrow-color': '#046'
			  }
			},
			{
			selector: '#jsondata',
			  style: {
				'curve-style': 'segments',
				'width': 5,
				'target-arrow-shape': 'triangle',
				'line-color': '#ffaaaa',
				'target-arrow-color': '#ffaaaa'
			  }
			},
			{
			selector: '#masterTable',
			  style: {
				'shape': 'octagon',
				'height': 120,
				'width': 120,
				'background-color': '#161f3a',
				'background-fit': 'contain',
				'border-width': 5,
				'border-opacity': 0.5
			  }
			},
			{
			selector: 'edge:active',
			  style: {
				'width': 5,
				'target-arrow-shape': 'triangle',
				'line-color': 'yellow',
				'target-arrow-color': '#046'
			  }
			},
			{
			selector: 'edge:selected',
			  style: {
				'width': 5,
				'target-arrow-shape': 'triangle',
				'line-color': 'cyan',
				'target-arrow-color': '#046'
			  }
			},
			{
			selector: 'node:active',
			  style: {
				'background-color': '#363f6a',
				'border-color': 'yellow',
				'border-width': 3,
				'border-opacity': 0.5
			  }
			},
			{
			selector: 'node:selected',
			  style: {
				'background-color': '#2266AA',
				'border-color': 'cyan',
				'border-width': 3,
				'border-opacity': 0.5,
			  }
			}
		],
	  
		/*elements: {
			nodes: [
			  { data: { id: 'masterTable', label: 'Master' } }
			]
		},*/
	
		ready: function(){
			window.cy = this;
		},
	});
	
	//var handles = new CytoscapeEdgeEditation;
	//handles.init(cy);
	
	
	cy.on('tap', function(event){
	  // target holds a reference to the originator
	  // of the event (core or element)
	  var evtTarget = event.target;

	  if( evtTarget === cy ){
		console.log('tap on background');
	  } else {
			if(evtTarget.isNode())
			{
				var nodedata = evtTarget.data().label;
				console.log('tap on node: '+nodedata );
				$("#openpopupdefinerelation").modal('hide');
				
				if(isConnectingNodes && nodedata!="Master")
				{
					$("#dropdownMenu2").prop("disabled",false);
					isConnectingNodes = false;
					++edgeInc;
					var elem = cy.add([
					  { group: "edges", data: { id: "e"+edgeInc, source: "masterTable", target: evtTarget.data().id } }
					]);
					
					var _this_modulationrule = new ModulationRule();
					if ( evtTarget.data().label.split(".").length>1 )
						_this_modulationrule.set( indexedDB_mastertable_name, evtTarget.data().label, connectingFieldName );
					else
						_this_modulationrule.set( indexedDB_mastertable_name,"", connectingFieldName, evtTarget.data().label );

					mappingDatasources.push( _this_modulationrule );
					localStorage.setItem("mappingDatasources", JSON.stringify( mappingDatasources ) );
				
					// The ID of the node related to this button
					var indexID = evtTarget.data().id.substr(1, evtTarget.data().id.length-1);
					var checkstr = "unlinknode_"+indexID;
					
					// enable unlink button on node tooltip
					$(".btn_unlinkres").each(function()
              		{
              			if( $(this).attr("id") === checkstr )
	              			$(this).prop("disabled",false);
              		});

				}
			}
			else if(evtTarget.isEdge())
			{	
				// open relations modal
				$("#openpopupdefinerelation").css("top", event.originalEvent["clientY"]-400+"px");
				$("#openpopupdefinerelation").css("left", event.originalEvent["clientX"]);
				
				var indexID = (evtTarget.data().id.substr(1, evtTarget.data().id.length-1))-1;
				var modrule = mappingDatasources.modrule[indexID];
				
				    // setup modal data				
					$("#masterfield").html(modrule.source_key);
					$("#srclabel").html(modrule.source_id);
					$("#srcindex").html(indexID);

					if( modrule.destination_id === "" )
						$("#destlabel").html( modrule.runtimelink_id );
					else
						$("#destlabel").html( modrule.destination_id );
					
					//var label = cy.$("#"+modrule.destination_id).attr("label");
					//$("#destlabel").html( label );
					
				$("#openpopupdefinerelation").modal();

				console.log('tap on edge from: '+evtTarget.source().data().label+' to:'+evtTarget.target().data().label+' on field:'+connectingFieldName);
			}
		
	  }
	});
	
}

function CytoscapeFindNodeID(labelName)
{
	var nodeID;
	return nodeID;
}

function OnLayoutReady()
{
}
function OnLayoutStop()
{	
}
