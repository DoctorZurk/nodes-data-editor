
//onload caricamento modulo data builer
$(document).ready(function() {
	
	var map = localStorage.getItem("prj_map");	
    if (map!== null) {
        mapprogetto(map);
    }else{
		alert("attenzione, non è presente nessun id progetto da mappare, se non siete finiti su questo modulo per sbaglio, segnalare agli sviluppatori");
		location.href = "/module/dashboard/";
    };
	
	// Custom websim SOAP module
	$("#datainizio" ).datepicker();
	$("#datafine" ).datepicker();
	
	Cytoscape_Setup();		//console.log("QTIP MASTER ID:"+ cy.$('#masterTable').qtip.data().id);
	
	// genera i quick links sui modali e menu
	RecuperaQuickLinkSalvati();
	
	// Setup
	var note = document.getElementById("note");
	var map = localStorage.getItem("prj_map");		
	mappingIndex = localStorage.getItem("mappingIndex");

	if(mappingIndex == null) {
		
		mappingIndex = 0;
		$("#delete_all_datasources").hide();
		$("#tpl_btn").hide();
		$("#export_schema_png").hide();
		
		$("#note").html('Video project: <i>'+localStorage.getItem("prj_name")+'</i>');

		//var linktoremove = cy.$("#masterTable");
		//cy.remove( linktoremove );

		// invite the user to import the first data source:
		$("#dropdownmenu4").dropdown("toggle");
		$("#dropdownMenu2").prop("disabled","disabled");
		
		// uncomment nextline and comment previous lines if want to use csv and databuilder modules separetely
		// alert("you must return to your video project and import main data again");
		// location.href="/module/csv/";
	}
	else
	{
		indexedDB_mastertable_name = localStorage.getItem("mappingMasterDataTable");
		localStorage.removeItem("empty");
		mappingDatasources = new MappingDatasource();
		mappingDatasources.set(
			localStorage.getItem("mappingSourceType_"+indexedDB_mastertable_name),
			localStorage.getItem("mappingFieldsNum_"+indexedDB_mastertable_name),
			localStorage.getItem("mappingRecordsNum_"+indexedDB_mastertable_name) 
		);
	
		var headerstring = JSON.parse(localStorage["headers_"+indexedDB_mastertable_name]);
		
		var fieldlistDOM="";
		for(var i=0;i<headerstring.length;i++){
			fieldlistDOM+='<li class="btn_linkres">'+headerstring[i]+'</li>';
		}
		var masterTipDomChunk  = '<br><span style="font-size:13px;color:#161f3a;">number of fields:'+localStorage.getItem("mappingFieldsNum_"+indexedDB_mastertable_name)+'<br>\n\
		number of records:'+localStorage.getItem("mappingRecordsNum_"+indexedDB_mastertable_name)+'</span><br>\n\
		<div class="dropup" style="font-family:monospace;font-size:10px;">\n\
		<button class="btn-xs dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="font-size:12px;color:#161f3a;">\n\
		Connect<span class="caret"></span></button>\n\
		<ul class="dropdown-menu" aria-labelledby="dropdownMenu2">'+fieldlistDOM+'\n\
			<li role="separator" class="divider"></li>\n\
			<li class="dropdown-header">Master field to modulate</li>\n\
		  </ul>\n\
		<button style="font-size:14px;color:#161f3a;" id="'+indexedDB_mastertable_name+'" title="show data" class="btn_editnodemaster"><i class="fa fa-edit"></i></button>\n\
		</div>';
				
		var masterFormat = localStorage.getItem("mappingSourceType_"+indexedDB_mastertable_name).toLowerCase();
		
		switch(masterFormat)
		{
			case "csv":
			case "xls":
			case "txt":
			case "xlsx":
				imageUrl = 'https://dev.littlesea.tv/modules/csv/images/csv.png';
				break;
			case "json":
				imageUrl = 'https://dev.littlesea.tv/modules/csv/images/json.png';
				break;
			case "rss":
				imageUrl = 'https://dev.littlesea.tv/modules/csv/images/feed_rss.png';
				break;
			default:
				imageUrl = 'https://dev.littlesea.tv/modules/csv/images/remote_api.png';
				break;
		}
		var eles = cy.add([ {group: "nodes", data: { id: "masterTable", label: "Master datasource"}, position: { x: 100, y: 100 }}  ]);
		
		cy.$("#masterTable").style({
			'background-image': imageUrl
		});
		
		// you can use qtip's regular options // see http://qtip2.com/
		cy.$('#masterTable').qtip({
		  content: '<label style="font-size:13px;color:#161f3a;">['+indexedDB_mastertable_name+'].'+masterFormat+'</label> '+masterTipDomChunk,
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
			
		$("#map_btn").show();
		$("#canc_btn").show();
		$("#save_spinner").show();	

		// query and store objectStore names		
		var krequest = window.indexedDB.open(indexedDB_database);
				
		krequest.onsuccess = function(event){
			
			var db = krequest.result;
			objectStoreNames = db.objectStoreNames;
			
			dbversion = db.version;
			console.log("INDEXEDDB '"+indexedDB_database+"' version n."+dbversion);
			
			$("#note").html('Video project: <i>'+localStorage.getItem("prj_name")+'</i><br>\n\
			'+objectStoreNames.length+' imported datasources<br>Master data will generate '+localStorage.getItem("mappingRecordsNum_"+indexedDB_mastertable_name)+" mapped videos." );

			// allinea le strutture con le basi di dati indexedDB e i metadati salvati su localStorage
			for(var j=0;j<objectStoreNames.length;j++){
				
				console.log( objectStoreNames[j] );				
				if(objectStoreNames[j]!=indexedDB_mastertable_name) // skip master(primary) data source
				{
					var sourcetype = localStorage.getItem("mappingSourceType_"+objectStoreNames[j]).toLowerCase();
					var fieldsnum = localStorage.getItem("mappingFieldsNum_"+objectStoreNames[j]);
					var recordsnum =localStorage.getItem("mappingRecordsNum_"+objectStoreNames[j]);
					
					var targetNode = "n";
					targetNode+=j;
					console.log("NODE ID:"+targetNode);					
					
					// TO DO: READ IN MappingDatasource data to fill info details properly
					var eles = cy.add([
						{ group: "nodes", data: { id: targetNode, label: objectStoreNames[j]+"."+sourcetype}, 
						position: { x: 200+j*100, y: 500 } } /*,
						{ group: "edges", data: { id: "e"+j, source: "masterTable", target: targetNode } }*/
					]);
				
					var imageUrl;
					switch(sourcetype)
					{
						case "csv":
						case "xls":
						case "txt":
						case "xlsx":
							imageUrl = 'https://dev.littlesea.tv/modules/csv/images/csv.png';
							break;
						case "json":
							imageUrl = 'https://dev.littlesea.tv/modules/csv/images/json.png';
							break;
						case "rss":
							imageUrl = 'https://dev.littlesea.tv/modules/csv/images/feed_rss.png';
							break;
						default:
							imageUrl = 'https://dev.littlesea.tv/modules/csv/images/remote_api.png';
							break;
					}
					cy.$("#"+targetNode).style({
						'background-image': imageUrl
					});				
					// Add tooltip DOM
					tipDomChunk = '<br><span style="font-size:11px;color:#161f3a;">number of fields:'+fieldsnum+'<br>number of records:'+recordsnum+'</span><br>\n\
					<button id="makemaster_'+j+'" class="btn_makemaster" title="set this data as master" style="font-size:14px;color:#161f3a;"><i class="fa fa-database" aria-hidden="true"></i></button>&nbsp;\n\
					<button id="editnode_'+j+'" class="btn_editnodedata" title="show data" style="font-size:14px;color:#161f3a;"><i class="fa fa-edit"></i></button>\n\
					<button id="deletenode_'+j+'" class="btn_deletenode" title="delete node" style="font-size:14px;color:#161f3a;"><i class="fa fa-trash-o" aria-hidden="true"></i></button>\n\
					<button id="unlinknode_'+j+'" class="btn_unlinkres" title="unlink node" style="font-size:14px;color:#161f3a;"><i class="fa fa-chain-broken" aria-hidden="true"></i></button>';				
					cy.$("#"+targetNode).qtip({
					  content: '<label style="font-size:13px;color:#161f3a;">['+objectStoreNames[j]+'].'+sourcetype+'</label> '+tipDomChunk,
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
				}
			}
			$("#save_spinner").hide();
			krequest.result.close();
			mappingIndex = objectStoreNames.length;
			console.log("numero di basi dati caricate per il progetto:" + mappingIndex);			
			console.log("current master table: "+indexedDB_mastertable_name);
			
			// Rigenere i nodi dei nodi dinamici realtime
			RigeneraNodiRealtime();
			
			// Rigenera le connessioni fra i nodi e i metadati
			RigeneraRelazioni();
				
		}
	}
	
	if(mappingIndex>1) $("#dropdownMenu2").prop("disabled",false);
	localStorage.setItem("mappingIndex", mappingIndex);
	indexedDB_prefix = indexedDB_tablename+("_"+mappingIndex);
		
	mlayout = cy.layout({
		name: 'circle',
			fit: true, // whether to fit the viewport to the graph
			padding: 50, // the padding on fit
			boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
			avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
			nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
			spacingFactor: 0.65, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
			radius: 100, // the radius of the circle
			startAngle: 2.7 / 2 * Math.PI/2, // where nodes start in radians
			sweep: Math.PI, // how many radians should be between the first and last node (defaults to full circle)
			clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
			sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
			animate: true, // whether to transition the node positions
			animationDuration: 300, // duration of animation in ms if enabled
			animationEasing: 'ease-in', // easing of animation if enabled
			animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
			ready: OnLayoutReady, // callback on layoutready
			stop: OnLayoutStop, // callback on layoutstop
			transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 
	});	
	
	cy.style().update();
	//cy.$('#masterTable').lock(); // Lock the position (undraggable) of the Master datasource
	mlayout.run();
});

loadFile = function(event) {
    var filename = $("#readfile").val();
    var extension = filename.replace(/^.*\./, '');
    if (extension !== "csv" &&
		extension !== "txt" &&
        extension !== "xls" &&
        extension !== "xlsx") {
        alert("Unsupported file extension. Please upload only spreadsheet format");
        return;
    }
    $("#openpopupcsv").modal('hide');
	$("#note" ).addClass( "nodisp" );
    $("#save_spinner").show();
	
    alasql.options.valueof = false;
	
    var res = alasql('CREATE INDEXEDDB DATABASE IF NOT EXISTS '+indexedDB_database+';\
            ATTACH INDEXEDDB DATABASE '+indexedDB_database+'; \
            USE '+indexedDB_database+'; \
            DROP TABLE IF EXISTS '+indexedDB_prefix+'; \
            CREATE TABLE '+indexedDB_prefix+'; \
            SELECT [*] INTO '+indexedDB_prefix+' FROM XLSX(?,{headers:true, separator:";" });\
            SELECT VALUE COUNT(*) FROM '+indexedDB_prefix, [event], function(data) {
        
						// Recupera i dati appena aggiunti e popola una tabella creata dinamicamente con essi
						recupera(extension);
						}
					);

};

//recupero dati e creazione nodo Cytoscape
var recupera = function(ext) {
	ext = ext.toLowerCase();
	localStorage.removeItem("empty");
	$("#save_spinner").show();
    
    alasql.promise('SELECT * FROM '+indexedDB_prefix).then(function(res) {
			
		var col = [];
		for (var i = 0; i < res.length; i++) {
			for (var key in res[i]) {
				if (col.indexOf(key) === -1) {
					col.push(key);
				}
			}
		}
		
		if (col == ""){
			localStorage.setItem('empty', 'true');
		}
			
		console.log("indexedDB table created: "+indexedDB_prefix+ " number of fields:"+col.length+" number of records:"+res.length);

		// Saved mapping data and headers for this table
		localStorage["headers_"+indexedDB_prefix] = JSON.stringify(col);
		localStorage.setItem("mappingSourceType_"+indexedDB_prefix, ext);
		localStorage.setItem("mappingFieldsNum_" +indexedDB_prefix, col.length);
		localStorage.setItem("mappingRecordsNum_"+indexedDB_prefix, res.length);
		
		// To do: add dynamically the node of the just created datasource
		if(mappingIndex==0)
		{
						
			$("#map_btn").show();
			$("#canc_btn").show();
			$("#save_spinner").show();	
			
			indexedDB_mastertable_name = indexedDB_tablename+("_0");
			localStorage.setItem("mappingMasterDataTable", indexedDB_mastertable_name);
			localStorage.removeItem("empty");
			
			$("#delete_all_datasources").show();
			$("#tpl_btn").show();
			$("#export_schema_png").show();
			
			mappingDatasources = new MappingDatasource();
			mappingDatasources.set(ext,col.length,res.length); 

			// Create the master node
			var headerstring = JSON.parse(localStorage["headers_"+indexedDB_mastertable_name]);
			var fieldlistDOM="";
			for(var i=0;i<headerstring.length;i++){
				fieldlistDOM+='<li class="btn_linkres">'+headerstring[i]+'</li>';
			}
			
			
			var masterTipDomChunk  = '<br><span style="font-size:13px;color:#161f3a;">number of fields:'+localStorage.getItem("mappingFieldsNum_"+indexedDB_mastertable_name)+'<br>\n\
			number of records:'+localStorage.getItem("mappingRecordsNum_"+indexedDB_mastertable_name)+'</span><br>\n\
			<div class="dropup" style="font-family:monospace;font-size:10px;">\n\
			<button class="btn-xs dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="font-size:12px;color:#161f3a;">\n\
			Connect<span class="caret"></span></button>\n\
			<ul class="dropdown-menu" aria-labelledby="dropdownMenu2">'+fieldlistDOM+'\n\
				<li role="separator" class="divider"></li>\n\
				<li class="dropdown-header">Master field to modulate</li>\n\
			  </ul>\n\
			<button style="font-size:14px;color:#161f3a;" id="'+indexedDB_mastertable_name+'" title="show data" class="btn_editnodemaster"><i class="fa fa-edit"></i></button>\n\
			</div>';
					
			var masterFormat = localStorage.getItem("mappingSourceType_"+indexedDB_mastertable_name).toLowerCase();
			
			switch(masterFormat)
			{
				case "csv":
				case "xls":
				case "txt":
				case "xlsx":
					imageUrl = 'https://dev.littlesea.tv/modules/csv/images/csv.png';
					break;
				case "json":
					imageUrl = 'https://dev.littlesea.tv/modules/csv/images/json.png';
					break;
				case "rss":
					imageUrl = 'https://dev.littlesea.tv/modules/csv/images/feed_rss.png';
					break;
				default:
					imageUrl = 'https://dev.littlesea.tv/modules/csv/images/remote_api.png';
					break;
			}
			var eles = cy.add([ {group: "nodes", data: { id: "masterTable", label: "Master datasource"}, position: { x: 150, y: 150 }}  ]);
			
			cy.$("#masterTable").style({
				'background-image': imageUrl
			});
			
			// you can use qtip's regular options // see http://qtip2.com/
			cy.$('#masterTable').qtip({
			  content: '<label style="font-size:13px;color:#161f3a;">['+indexedDB_mastertable_name+'].'+masterFormat+'</label> '+masterTipDomChunk,
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
			
			
		}
		else
		{
						
			var j = mappingIndex; // ERRORE ! indice nodo deve essere progressivo e non dipendente dall'indice delle basi dati che possono essere rimosse
			var targetNode = "n"+j;
			// Create the node	
			console.log("NODE ID:"+targetNode);	
			var eles = cy.add([
				{ group: "nodes", data: { id: targetNode, label: indexedDB_prefix+"."+ext}, 
				position: { x: 200+j*100, y: 400 } }
			]);
			
			var imageUrl;
			switch(ext)
			{
				case "csv":
				case "xls":
				case "txt":
				case "xlsx":
					imageUrl = 'https://dev.littlesea.tv/modules/csv/images/csv.png';
					break;
				case "json":
					imageUrl = 'https://dev.littlesea.tv/modules/csv/images/json.png';
					break;
				case "rss":
					imageUrl = 'https://dev.littlesea.tv/modules/csv/images/feed_rss.png';
					break;
				default:
					imageUrl = 'https://dev.littlesea.tv/modules/csv/images/remote_api.png';
					break;
			}
			cy.$("#"+targetNode).style({
				'background-image': imageUrl
			});
			
			tipDomChunk = '<br><span style="font-size:11px;color:#161f3a;">number of fields:'+col.length+'<br>number of records:'+res.length+'</span><br>\n\
			<button id="makemaster_'+j+'" class="btn_makemaster" title="set this as the primary master" style="font-size:14px;color:#161f3a;"><i class="fa fa-database" aria-hidden="true"></i></button>&nbsp;\n\
			<button id="editnode_'+j+'" class="btn_editnodedata" title="show data" style="font-size:14px;color:#161f3a;"><i class="fa fa-edit"></i></button>\n\
			<button id="deletenode_'+j+'" class="btn_deletenode" title="delete node" style="font-size:14px;color:#161f3a;"><i class="fa fa-trash-o" aria-hidden="true"></i></button>\n\
			<button id="unlinknode_'+j+'" class="btn_unlinkres" disabled title="unlink node" style="font-size:14px;color:#161f3a;"><i class="fa fa-chain-broken" aria-hidden="true"></i></button>';
			
			cy.$("#"+targetNode).qtip({
			  content: '<label style="font-size:13px;color:#161f3a;">['+indexedDB_prefix+'].'+ext+'</label> '+tipDomChunk,
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
			// Update DB version and objectStoreNames asynchronously
			var krequest = window.indexedDB.open(indexedDB_database);
			krequest.onsuccess = function(event){
				
				var db = krequest.result;
				objectStoreNames = db.objectStoreNames;
				dbversion = db.version;
				console.log("INDEXEDDB '"+indexedDB_database+"' version n."+dbversion+" objectStores names updated");
				
				krequest.result.close();
			}
				
		}
		++mappingIndex;
		localStorage.setItem("mappingIndex",mappingIndex);
		indexedDB_prefix = indexedDB_tablename+("_"+mappingIndex);
		console.log("next db prefix to use: "+indexedDB_prefix);
		$("#save_spinner").hide();
		$("#showdatamodal").modal("hide");
		$("#openservicesoap").modal("hide");
		$("#modalremoteapi").modal("hide");
		$("#openpopupjson").modal("hide");
		cy.style().update();
		mlayout.run();
		
    });	
};

recupera_dati = function(datasourcename, offset=100) {
	
	alasql.options.valueof = false; 
    $("#save_spinner").show();
	$("#show_data").hide();
	
	var res = alasql('ATTACH INDEXEDDB DATABASE '+indexedDB_database+'; USE '+indexedDB_database,[event], function(data) {

		alasql.promise('SELECT TOP '+offset+' * FROM '+datasourcename)
			.then(function(res) {
				var col = [];
				for (var i = 0; i < res.length; i++) {
					for (var key in res[i]) {
						if (col.indexOf(key) === -1) {
							col.push(key);
						}
					}
				}
				// crea tabella dinamica.
				var table = document.createElement("table");
				table.setAttribute("class","table table_option table-striped");
				var head = document.createElement("thead");
				head.setAttribute("class","th_option");
				table.appendChild(head);
				
			   if (col == ""){
				table.innerHTML="<span class='empty'>Empty data, Please try another csv</span>";
			   }
				// crea header html con dati estratti prima
				var tr = head.insertRow(-1); // row
				var th = document.createElement("th"); // header
				th.setAttribute("scope","col")
				th.innerHTML = "#";
				head.appendChild(th);
				for (var i = 0; i < col.length; i++) {
					var th = document.createElement("th"); // header
					th.setAttribute("scope","col")
					th.innerHTML = col[i];
					head.appendChild(th);
				}
				var body = document.createElement("tbody");
				table.appendChild(body);
				 
				// aggiungi dati json nella tabella
				for (var i = 0; i < res.length; i++) {

					tr = body.insertRow(-1);
					tr.setAttribute("scope","row")
					
					var tabCell = tr.insertCell(-1);
					tabCell.innerHTML = i; 
					
					for (var j = 0; j < col.length; j++) {
						var tabCell = tr.insertCell(-1);
						
						if(res[i][col[j]] === undefined){
						   tabCell.innerHTML =""; 
						}else{
						   tabCell.innerHTML = res[i][col[j]];
						}
					}
				}
				// attacca la tabella al contenitore
				var divContainer = document.getElementById("show_data");
				divContainer.innerHTML = "";
				divContainer.appendChild(table);
			});
		}
	);
	
	$("#save_spinner").hide();
    $("#showdatamodal").modal();
    $("#show_data").slideDown();
		
};

//blocco tasto back browser
history.pushState(null, null, location.href);
window.onpopstate = function() {
    history.go(1);
};

//caricamento progetto per mapping
function mapprogetto(id) {
    var link = "/API/v1/load/project/" + id;
    var requestURL = link;
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    request.onload = function() {
        var json = request.response;
        localStorage.setItem("mapprjn", "1");
        var idlib = json.data.project.library.id;
        var hash = json.data.project.library.hash;
        var lib = "Check" + hash;
        var font1 = json.data.project.settings.ASSET.FONT.Font_01;
        var font2 = json.data.project.settings.ASSET.FONT.Font_02;
        var nome = json.data.project.library.name;
        var standard = 0;
        var progetto = json.data.project.name;
        var audio = json.data.project.settings.ASSET.AUDIO;
        var videoback = json.data.project.settings.ASSET.VIDEO;
        var videomap = json.data.localStorage.videoMap;
        
		//check della libreria e salvataggio nel localstorage
        localStorage.setItem("formato", nome);
        localStorage.setItem("videomap", JSON.stringify(videomap));
        
        localStorage.setItem("prj_rec", "1");
        localStorage.setItem("prj_id", id);
       
        localStorage.setItem("firstfont", font1);
        localStorage.setItem("secondfont", font2);
		
        //variabili localstorage per making area
        localStorage.setItem("idlibreria", idlib);
        localStorage.setItem("standard", standard);
        localStorage.setItem("selectedLib", nome + ',' + hash);
		
        //se c'è audio salvo nel localstorage l'url e cambio la dicitura sul button
        if (audio !== null) {
            localStorage.setItem("audio", audio);
        }
        //se c'è video salvo nel localstorage l'url e cambio la dicitura sul button
        if (videoback !== null) {
            localStorage.setItem("videoback", videoback);
        }
        for (i = 0; i < json.data.localStorage.INFO.length; i++) {
            var titolo = json.data.localStorage.INFO[i].key;
            var titolofinale = titolo.replace(/["]+/g, '');
            localStorage.setItem(titolofinale, JSON.stringify(json.data.localStorage.INFO[i].value));
        }
        for (i = 0; i < json.data.localStorage.LAYOUT.length; i++) {
            var titolo = json.data.localStorage.LAYOUT[i].key;
            var titolofinale = titolo.replace(/["]+/g, '');
            localStorage.setItem(titolofinale, JSON.stringify(json.data.localStorage.LAYOUT[i].value));
        }
        for (i = 0; i < json.data.localStorage.BACKGROUND.length; i++) {
            var titolo = json.data.localStorage.BACKGROUND[i].key;
            var titolofinale = titolo.replace(/["]+/g, '');
            localStorage.setItem(titolofinale, JSON.stringify(json.data.localStorage.BACKGROUND[i].value));
        }
        for (i = 0; i < json.data.localStorage.FRAME.length; i++) {
            var titolo = json.data.localStorage.FRAME[i].key;
            var titolofinale = titolo.replace(/["]+/g, '');
            localStorage.setItem(titolofinale, JSON.stringify(json.data.localStorage.FRAME[i].value));
        }
        for (i = 0; i < json.data.localStorage.TRANSITION.length; i++) {
            var titolo = json.data.localStorage.TRANSITION[i].key;
            var titolofinale = titolo.replace(/["]+/g, '');
            localStorage.setItem(titolofinale, JSON.stringify(json.data.localStorage.TRANSITION[i].value));
        }

        var array = [];
        var indice = 0;
        for (i = 0; i < json.data.project.scene_list.length; i++) {
            indice++;
            var j = i + 1;
            localStorage.setItem("scenepopup" + j, json.data.project.scene_list[i].name);
            localStorage.setItem("sfondopopup" + j, json.data.project.scene_list[i].thumbnail);
            array.push("popup" + j);
        }

        localStorage.setItem("ordine", JSON.stringify(array));
        localStorage.setItem("indice", indice);
        setTimeout(function() {
          
        //aggiungo i colori alla special palette e imposto la chiave nel localstorage
        var paletteList = {};
        paletteList["Color_01"] = [json.data.project.settings.ASSET.PALETTE.Color_01[0], json.data.project.settings.ASSET.PALETTE.Color_01[1], json.data.project.settings.ASSET.PALETTE.Color_01[2]];
        paletteList["Color_02"] = [json.data.project.settings.ASSET.PALETTE.Color_02[0], json.data.project.settings.ASSET.PALETTE.Color_02[1], json.data.project.settings.ASSET.PALETTE.Color_02[2]];
        paletteList["Color_03"] = [json.data.project.settings.ASSET.PALETTE.Color_03[0], json.data.project.settings.ASSET.PALETTE.Color_03[1], json.data.project.settings.ASSET.PALETTE.Color_03[2]];
        paletteList["Color_04"] = [json.data.project.settings.ASSET.PALETTE.Color_04[0], json.data.project.settings.ASSET.PALETTE.Color_04[1], json.data.project.settings.ASSET.PALETTE.Color_04[2]];
        paletteList["Color_05"] = [json.data.project.settings.ASSET.PALETTE.Color_05[0], json.data.project.settings.ASSET.PALETTE.Color_05[1], json.data.project.settings.ASSET.PALETTE.Color_05[2]];
        var testo = {
     
            "Color_01": [paletteList["Color_01"][0], paletteList["Color_01"][1], paletteList["Color_01"][2]],
            "Color_02": [paletteList["Color_02"][0], paletteList["Color_02"][1], paletteList["Color_02"][2]],
            "Color_03": [paletteList["Color_03"][0], paletteList["Color_03"][1], paletteList["Color_03"][2]],
            "Color_04": [paletteList["Color_04"][0], paletteList["Color_04"][1], paletteList["Color_04"][2]],
            "Color_05": [paletteList["Color_05"][0], paletteList["Color_05"][1], paletteList["Color_05"][2]]
        };
        localStorage.setItem("palette", JSON.stringify(testo));  
        }, 50);
    };
}

