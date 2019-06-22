'use strict';

var indexedDB_database = "DATASOURCES"; // INDEXEDDB NAME
var indexedDB_table = ""; 
var objectStoreNames; // data tables imported in the database
var mappingIndex = 0; // total number of data sources (OBSOLETE, PLEASE UPDATE!)
var indexedDB_prefix = "";
var indexedDB_tablename = "dati";
var indexedDB_mastertable_name = "dati_0";

var output_numOfFields = 0;
var output_numOfRecords = 0;

var db;
var dbversion;
var jsonIsClickable = true; // will be enabled by UI choice

// Quick links
var quickLinkIndex = 0;
var quickLinks = new Array();  
const maxNumSavedQuickLinks = 13;

// cytoscape JS graph variables
var cy;
var mlayout;
var isConnectingNodes = false;
var connectingFieldName = "";
var edgeInc = 0;
var rtNodeInc = 0;
var connectMasterButton;

// Internal classes for mapping
var MappingDatasource = class
{
	constructor()
	{
		this.type = null; // file extension (txt,cvs,xls,xlsx,json,remote)
		this.fields = null;
		this.records = null;
		this.modrule = [];
	}
}
MappingDatasource.prototype.set = function(_type,_fields,_records) {
    this.type = _type;
	this.fields = _fields;
	this.records = _records;
};
MappingDatasource.prototype.push = function(_item)
{
	this.modrule.push(_item);
};
var ModulationRule = class
{
	constructor()
	{
		this.source_id = "";		// the master table name
		this.source_key = "";		// the field/key to modulate in the master table
		this.destination_id = "";	// the related destination table for this relation
		this.runtimelink_id = "";	// the related runtime Link id for this relation
		this.modulation_type = ""; 			// join / replace / merge / special
		this.rule = "";  			// rule definition string
	}
}
ModulationRule.prototype.set = function(_source_id, _source_key, _destination_id="", destination_param, _modulation_type="replace", _rule="regexp:") {
	this.source_id = _source_id;
	this.source_key = _source_key;
	this.destination_id = _destination_id;
	this.destination_param = _destination_param;
	this.modulation_type = _modulation_type; 
	this.rule = _rule; 
};
ModulationRule.prototype.push = function(_item)
{
};

// Runtime links
var RuntimeLink = class
{
	constructor()
	{
		this.label = "";
		this.domain = "";
		this.path = "";
		this.parameters = {};				
		this.jsonpath = "root";				// object "leaf" to be grabbed after the API call on the returned json
		this.protocol_prefix = "https://";	// the protocol HTTP/HTTPS, default HTTPS
		this.auth = false;  				// is an authorized private API ?
		this.noauth_key = "";				// oauth public key
		this.noauth_secret = "";			// oauth private key
	}
}
RuntimeLink.prototype.set = function(_label,_domain,_path,_parameters,jsonpath) {
		this.label = _label;
		this.domain = _domain;
		this.path = _path;
		this.parameters = _parameters;
		this.jsonpath = "root";
		this.protocol_prefix = "https://";
		this.auth = false; 
		this.oauth_key = "";				
		this.oauth_secret = "";
};
RuntimeLink.prototype.push = function(_item)
{
	  
};
var mappingDatasources;
var modulationRules;
var runtimeLinks = new Array();
