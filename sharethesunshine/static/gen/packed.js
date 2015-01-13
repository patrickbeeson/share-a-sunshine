!(function(factory){if(typeof define==='function'&&define.amd){define(['jquery'],factory);}else{factory(jQuery);}}(function($){
 if('undefined'===typeof $&&'undefined'!==typeof window.jQuery)
$=window.jQuery;var ParsleyUtils={

 attr:function($element,namespace,checkAttr){var
attribute,obj={},msie=this.msieversion(),regex=new RegExp('^'+namespace,'i');if('undefined'===typeof $element||'undefined'===typeof $element[0])
return{};for(var i in $element[0].attributes){attribute=$element[0].attributes[i];if('undefined'!==typeof attribute&&null!==attribute&&(!msie||msie>=8||attribute.specified)&&regex.test(attribute.name)){if('undefined'!==typeof checkAttr&&new RegExp(checkAttr+'$','i').test(attribute.name))
return true;obj[this.camelize(attribute.name.replace(namespace,''))]=this.deserializeValue(attribute.value);}}
return'undefined'===typeof checkAttr?obj:false;},setAttr:function($element,namespace,attr,value){$element[0].setAttribute(this.dasherize(namespace+attr),String(value));}, get:function(obj,path){var
i=0,paths=(path||'').split('.');while(this.isObject(obj)||this.isArray(obj)){obj=obj[paths[i++]];if(i===paths.length)
return obj;}
return undefined;},hash:function(length){return String(Math.random()).substring(2,length?length+2:9);}, isArray:function(mixed){return Object.prototype.toString.call(mixed)==='[object Array]';}, isObject:function(mixed){return mixed===Object(mixed);}, deserializeValue:function(value){var num;try{return value?value=="true"||(value=="false"?false:value=="null"?null:!isNaN(num=Number(value))?num:/^[\[\{]/.test(value)?$.parseJSON(value):value):value;}catch(e){return value;}}, camelize:function(str){return str.replace(/-+(.)?/g,function(match,chr){return chr?chr.toUpperCase():'';});}, dasherize:function(str){return str.replace(/::/g,'/').replace(/([A-Z]+)([A-Z][a-z])/g,'$1_$2').replace(/([a-z\d])([A-Z])/g,'$1_$2').replace(/_/g,'-').toLowerCase();},
 msieversion:function(){var
ua=window.navigator.userAgent,msie=ua.indexOf('MSIE ');if(msie>0||!!navigator.userAgent.match(/Trident.*rv\:11\./))
return parseInt(ua.substring(msie+5,ua.indexOf('.',msie)),10);return 0;}};

var ParsleyDefaults={
 namespace:'data-parsley-', inputs:'input, textarea, select', excluded:'input[type=button], input[type=submit], input[type=reset], input[type=hidden]', priorityEnabled:true,
 uiEnabled:true, validationThreshold:3,focus:'first',trigger:false, errorClass:'parsley-error', successClass:'parsley-success',
classHandler:function(ParsleyField){},
errorsContainer:function(ParsleyField){}, errorsWrapper:'<ul class="parsley-errors-list"></ul>', errorTemplate:'<li></li>'};var ParsleyAbstract=function(){};ParsleyAbstract.prototype={asyncSupport:false,actualizeOptions:function(){this.options=this.OptionsFactory.get(this);return this;}, validateThroughValidator:function(value,constraints,priority){return window.ParsleyValidator.validate.apply(window.ParsleyValidator,[value,constraints,priority]);},

 subscribe:function(name,fn){$.listenTo(this,name.toLowerCase(),fn);return this;}, unsubscribe:function(name){$.unsubscribeTo(this,name.toLowerCase());return this;}, reset:function(){ if('ParsleyForm'!==this.__class__)
return $.emit('parsley:field:reset',this); for(var i=0;i<this.fields.length;i++)
$.emit('parsley:field:reset',this.fields[i]);$.emit('parsley:form:reset',this);},destroy:function(){ if('ParsleyForm'!==this.__class__){this.$element.removeData('Parsley');this.$element.removeData('ParsleyFieldMultiple');$.emit('parsley:field:destroy',this);return;} 
for(var i=0;i<this.fields.length;i++)
this.fields[i].destroy();this.$element.removeData('Parsley');$.emit('parsley:form:destroy',this);}};var Validator=(function(){var exports={};var Validator=function(options){this.__class__='Validator';this.__version__='1.0.0';this.options=options||{};this.bindingKey=this.options.bindingKey||'_validatorjsConstraint';};Validator.prototype={constructor:Validator,validate:function(objectOrString,AssertsOrConstraintOrGroup,group){if('string'!==typeof objectOrString&&'object'!==typeof objectOrString)
throw new Error('You must validate an object or a string'); if('string'===typeof objectOrString||_isArray(objectOrString))
return this._validateString(objectOrString,AssertsOrConstraintOrGroup,group); if(this.isBinded(objectOrString))
return this._validateBindedObject(objectOrString,AssertsOrConstraintOrGroup); return this._validateObject(objectOrString,AssertsOrConstraintOrGroup,group);},bind:function(object,constraint){if('object'!==typeof object)
throw new Error('Must bind a Constraint to an object');object[this.bindingKey]=new Constraint(constraint);return this;},unbind:function(object){if('undefined'===typeof object._validatorjsConstraint)
return this;delete object[this.bindingKey];return this;},isBinded:function(object){return'undefined'!==typeof object[this.bindingKey];},getBinded:function(object){return this.isBinded(object)?object[this.bindingKey]:null;},_validateString:function(string,assert,group){var result,failures=[];if(!_isArray(assert))
assert=[assert];for(var i=0;i<assert.length;i++){if(!(assert[i]instanceof Assert))
throw new Error('You must give an Assert or an Asserts array to validate a string');result=assert[i].check(string,group);if(result instanceof Violation)
failures.push(result);}
return failures.length?failures:true;},_validateObject:function(object,constraint,group){if('object'!==typeof constraint)
throw new Error('You must give a constraint to validate an object');if(constraint instanceof Constraint)
return constraint.check(object,group);return new Constraint(constraint).check(object,group);},_validateBindedObject:function(object,group){return object[this.bindingKey].check(object,group);}};Validator.errorCode={must_be_a_string:'must_be_a_string',must_be_an_array:'must_be_an_array',must_be_a_number:'must_be_a_number',must_be_a_string_or_array:'must_be_a_string_or_array'};var Constraint=function(data,options){this.__class__='Constraint';this.options=options||{};this.nodes={};if(data){try{this._bootstrap(data);}catch(err){throw new Error('Should give a valid mapping object to Constraint',err,data);}}};Constraint.prototype={constructor:Constraint,check:function(object,group){var result,failures={};for(var property in this.nodes){var isRequired=false;var constraint=this.get(property);var constraints=_isArray(constraint)?constraint:[constraint];for(var i=constraints.length-1;i>=0;i--){if('Required'===constraints[i].__class__){isRequired=constraints[i].requiresValidation(group);continue;}}
if(!this.has(property,object)&&!this.options.strict&&!isRequired){continue;}
try{if(!this.has(property,this.options.strict||isRequired?object:undefined)){ new Assert().HaveProperty(property).validate(object);}
result=this._check(property,object[property],group); if((_isArray(result)&&result.length>0)||(!_isArray(result)&&!_isEmptyObject(result))){failures[property]=result;}}catch(violation){failures[property]=violation;}}
return _isEmptyObject(failures)?true:failures;},add:function(node,object){if(object instanceof Assert||(_isArray(object)&&object[0]instanceof Assert)){this.nodes[node]=object;return this;}
if('object'===typeof object&&!_isArray(object)){this.nodes[node]=object instanceof Constraint?object:new Constraint(object);return this;}
throw new Error('Should give an Assert, an Asserts array, a Constraint',object);},has:function(node,nodes){nodes='undefined'!==typeof nodes?nodes:this.nodes;return'undefined'!==typeof nodes[node];},get:function(node,placeholder){return this.has(node)?this.nodes[node]:placeholder||null;},remove:function(node){var _nodes=[];for(var i in this.nodes)
if(i!==node)
_nodes[i]=this.nodes[i];this.nodes=_nodes;return this;},_bootstrap:function(data){if(data instanceof Constraint)
return this.nodes=data.nodes;for(var node in data)
this.add(node,data[node]);},_check:function(node,value,group){ if(this.nodes[node]instanceof Assert)
return this._checkAsserts(value,[this.nodes[node]],group); if(_isArray(this.nodes[node]))
return this._checkAsserts(value,this.nodes[node],group); if(this.nodes[node]instanceof Constraint)
return this.nodes[node].check(value,group);throw new Error('Invalid node',this.nodes[node]);},_checkAsserts:function(value,asserts,group){var result,failures=[];for(var i=0;i<asserts.length;i++){result=asserts[i].check(value,group);if('undefined'!==typeof result&&true!==result)
failures.push(result);


}
return failures;}};var Violation=function(assert,value,violation){this.__class__='Violation';if(!(assert instanceof Assert))
throw new Error('Should give an assertion implementing the Assert interface');this.assert=assert;this.value=value;if('undefined'!==typeof violation)
this.violation=violation;};Violation.prototype={show:function(){var show={assert:this.assert.__class__,value:this.value};if(this.violation)
show.violation=this.violation;return show;},__toString:function(){if('undefined'!==typeof this.violation)
this.violation='", '+this.getViolation().constraint+' expected was '+this.getViolation().expected;return this.assert.__class__+' assert failed for "'+this.value+this.violation||'';},getViolation:function(){var constraint,expected;for(constraint in this.violation)
expected=this.violation[constraint];return{constraint:constraint,expected:expected};}};var Assert=function(group){this.__class__='Assert';this.__parentClass__=this.__class__;this.groups=[];if('undefined'!==typeof group)
this.addGroup(group);};Assert.prototype={construct:Assert,requiresValidation:function(group){if(group&&!this.hasGroup(group))
return false;if(!group&&this.hasGroups())
return false;return true;},check:function(value,group){if(!this.requiresValidation(group))
return;try{return this.validate(value,group);}catch(violation){return violation;}},hasGroup:function(group){if(_isArray(group))
return this.hasOneOf(group); if('Any'===group)
return true; if(!this.hasGroups())
return'Default'===group;return-1!==this.groups.indexOf(group);},hasOneOf:function(groups){for(var i=0;i<groups.length;i++)
if(this.hasGroup(groups[i]))
return true;return false;},hasGroups:function(){return this.groups.length>0;},addGroup:function(group){if(_isArray(group))
return this.addGroups(group);if(!this.hasGroup(group))
this.groups.push(group);return this;},removeGroup:function(group){var _groups=[];for(var i=0;i<this.groups.length;i++)
if(group!==this.groups[i])
_groups.push(this.groups[i]);this.groups=_groups;return this;},addGroups:function(groups){for(var i=0;i<groups.length;i++)
this.addGroup(groups[i]);return this;},HaveProperty:function(node){this.__class__='HaveProperty';this.node=node;this.validate=function(object){if('undefined'===typeof object[this.node])
throw new Violation(this,object,{value:this.node});return true;};return this;},Blank:function(){this.__class__='Blank';this.validate=function(value){if('string'!==typeof value)
throw new Violation(this,value,{value:Validator.errorCode.must_be_a_string});if(''!==value.replace(/^\s+/g,'').replace(/\s+$/g,''))
throw new Violation(this,value);return true;};return this;},Callback:function(fn){this.__class__='Callback';this.arguments=Array.prototype.slice.call(arguments);if(1===this.arguments.length)
this.arguments=[];else
this.arguments.splice(0,1);if('function'!==typeof fn)
throw new Error('Callback must be instanciated with a function');this.fn=fn;this.validate=function(value){var result=this.fn.apply(this,[value].concat(this.arguments));if(true!==result)
throw new Violation(this,value,{result:result});return true;};return this;},Choice:function(list){this.__class__='Choice';if(!_isArray(list)&&'function'!==typeof list)
throw new Error('Choice must be instanciated with an array or a function');this.list=list;this.validate=function(value){var list='function'===typeof this.list?this.list():this.list;for(var i=0;i<list.length;i++)
if(value===list[i])
return true;throw new Violation(this,value,{choices:list});};return this;},Collection:function(assertOrConstraint){this.__class__='Collection';this.constraint='undefined'!==typeof assertOrConstraint?(assertOrConstraint instanceof Assert?assertOrConstraint:new Constraint(assertOrConstraint)):false;this.validate=function(collection,group){var result,validator=new Validator(),count=0,failures={},groups=this.groups.length?this.groups:group;if(!_isArray(collection))
throw new Violation(this,array,{value:Validator.errorCode.must_be_an_array});for(var i=0;i<collection.length;i++){result=this.constraint?validator.validate(collection[i],this.constraint,groups):validator.validate(collection[i],groups);if(!_isEmptyObject(result))
failures[count]=result;count++;}
return!_isEmptyObject(failures)?failures:true;};return this;},Count:function(count){this.__class__='Count';this.count=count;this.validate=function(array){if(!_isArray(array))
throw new Violation(this,array,{value:Validator.errorCode.must_be_an_array});var count='function'===typeof this.count?this.count(array):this.count;if(isNaN(Number(count)))
throw new Error('Count must be a valid interger',count);if(count!==array.length)
throw new Violation(this,array,{count:count});return true;};return this;},Email:function(){this.__class__='Email';this.validate=function(value){var regExp=/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;if('string'!==typeof value)
throw new Violation(this,value,{value:Validator.errorCode.must_be_a_string});if(!regExp.test(value))
throw new Violation(this,value);return true;};return this;},EqualTo:function(reference){this.__class__='EqualTo';if('undefined'===typeof reference)
throw new Error('EqualTo must be instanciated with a value or a function');this.reference=reference;this.validate=function(value){var reference='function'===typeof this.reference?this.reference(value):this.reference;if(reference!==value)
throw new Violation(this,value,{value:reference});return true;};return this;},GreaterThan:function(threshold){this.__class__='GreaterThan';if('undefined'===typeof threshold)
throw new Error('Should give a threshold value');this.threshold=threshold;this.validate=function(value){if(''===value||isNaN(Number(value)))
throw new Violation(this,value,{value:Validator.errorCode.must_be_a_number});if(this.threshold>=value)
throw new Violation(this,value,{threshold:this.threshold});return true;};return this;},GreaterThanOrEqual:function(threshold){this.__class__='GreaterThanOrEqual';if('undefined'===typeof threshold)
throw new Error('Should give a threshold value');this.threshold=threshold;this.validate=function(value){if(''===value||isNaN(Number(value)))
throw new Violation(this,value,{value:Validator.errorCode.must_be_a_number});if(this.threshold>value)
throw new Violation(this,value,{threshold:this.threshold});return true;};return this;},InstanceOf:function(classRef){this.__class__='InstanceOf';if('undefined'===typeof classRef)
throw new Error('InstanceOf must be instanciated with a value');this.classRef=classRef;this.validate=function(value){if(true!==(value instanceof this.classRef))
throw new Violation(this,value,{classRef:this.classRef});return true;};return this;},Length:function(boundaries){this.__class__='Length';if(!boundaries.min&&!boundaries.max)
throw new Error('Lenth assert must be instanciated with a { min: x, max: y } object');this.min=boundaries.min;this.max=boundaries.max;this.validate=function(value){if('string'!==typeof value&&!_isArray(value))
throw new Violation(this,value,{value:Validator.errorCode.must_be_a_string_or_array});if('undefined'!==typeof this.min&&this.min===this.max&&value.length!==this.min)
throw new Violation(this,value,{min:this.min,max:this.max});if('undefined'!==typeof this.max&&value.length>this.max)
throw new Violation(this,value,{max:this.max});if('undefined'!==typeof this.min&&value.length<this.min)
throw new Violation(this,value,{min:this.min});return true;};return this;},LessThan:function(threshold){this.__class__='LessThan';if('undefined'===typeof threshold)
throw new Error('Should give a threshold value');this.threshold=threshold;this.validate=function(value){if(''===value||isNaN(Number(value)))
throw new Violation(this,value,{value:Validator.errorCode.must_be_a_number});if(this.threshold<=value)
throw new Violation(this,value,{threshold:this.threshold});return true;};return this;},LessThanOrEqual:function(threshold){this.__class__='LessThanOrEqual';if('undefined'===typeof threshold)
throw new Error('Should give a threshold value');this.threshold=threshold;this.validate=function(value){if(''===value||isNaN(Number(value)))
throw new Violation(this,value,{value:Validator.errorCode.must_be_a_number});if(this.threshold<value)
throw new Violation(this,value,{threshold:this.threshold});return true;};return this;},NotNull:function(){this.__class__='NotNull';this.validate=function(value){if(null===value||'undefined'===typeof value)
throw new Violation(this,value);return true;};return this;},NotBlank:function(){this.__class__='NotBlank';this.validate=function(value){if('string'!==typeof value)
throw new Violation(this,value,{value:Validator.errorCode.must_be_a_string});if(''===value.replace(/^\s+/g,'').replace(/\s+$/g,''))
throw new Violation(this,value);return true;};return this;},Null:function(){this.__class__='Null';this.validate=function(value){if(null!==value)
throw new Violation(this,value);return true;};return this;},Range:function(min,max){this.__class__='Range';if('undefined'===typeof min||'undefined'===typeof max)
throw new Error('Range assert expects min and max values');this.min=min;this.max=max;this.validate=function(value){try{ if(('string'===typeof value&&isNaN(Number(value)))||_isArray(value))
new Assert().Length({min:this.min,max:this.max}).validate(value); else
new Assert().GreaterThanOrEqual(this.min).validate(value)&&new Assert().LessThanOrEqual(this.max).validate(value);return true;}catch(violation){throw new Violation(this,value,violation.violation);}
return true;};return this;},Regexp:function(regexp,flag){this.__class__='Regexp';if('undefined'===typeof regexp)
throw new Error('You must give a regexp');this.regexp=regexp;this.flag=flag||'';this.validate=function(value){if('string'!==typeof value)
throw new Violation(this,value,{value:Validator.errorCode.must_be_a_string});if(!new RegExp(this.regexp,this.flag).test(value))
throw new Violation(this,value,{regexp:this.regexp,flag:this.flag});return true;};return this;},Required:function(){this.__class__='Required';this.validate=function(value){if('undefined'===typeof value)
throw new Violation(this,value);try{if('string'===typeof value)
new Assert().NotNull().validate(value)&&new Assert().NotBlank().validate(value);else if(true===_isArray(value))
new Assert().Length({min:1}).validate(value);}catch(violation){throw new Violation(this,value);}
return true;};return this;},Unique:function(object){this.__class__='Unique';if('object'===typeof object)
this.key=object.key;this.validate=function(array){var value,store=[];if(!_isArray(array))
throw new Violation(this,array,{value:Validator.errorCode.must_be_an_array});for(var i=0;i<array.length;i++){value='object'===typeof array[i]?array[i][this.key]:array[i];if('undefined'===typeof value)
continue;if(-1!==store.indexOf(value))
throw new Violation(this,array,{value:value});store.push(value);}
return true;};return this;}}; exports.Assert=Assert;exports.Validator=Validator;exports.Violation=Violation;exports.Constraint=Constraint;
 if(!Array.prototype.indexOf)
Array.prototype.indexOf=function(searchElement){if(this===null){throw new TypeError();}
var t=Object(this);var len=t.length>>>0;if(len===0){return-1;}
var n=0;if(arguments.length>1){n=Number(arguments[1]);if(n!=n){ n=0;}else if(n!==0&&n!=Infinity&&n!=-Infinity){n=(n>0||-1)*Math.floor(Math.abs(n));}}
if(n>=len){return-1;}
var k=n>=0?n:Math.max(len-Math.abs(n),0);for(;k<len;k++){if(k in t&&t[k]===searchElement){return k;}}
return-1;}; var _isEmptyObject=function(obj){for(var property in obj)
return false;return true;};var _isArray=function(obj){return Object.prototype.toString.call(obj)==='[object Array]';}; if(typeof define==='function'&&define.amd){define('vendors/validator.js/dist/validator',[],function(){return exports;});}else if(typeof module!=='undefined'&&module.exports){module.exports=exports;}else{window['undefined'!==typeof validatorjs_ns?validatorjs_ns:'Validator']=exports;}
return exports;})(); Validator='undefined'!==typeof Validator?Validator:('undefined'!==typeof module?module.exports:null);var ParsleyValidator=function(validators,catalog){this.__class__='ParsleyValidator';this.Validator=Validator; this.locale='en';this.init(validators||{},catalog||{});};ParsleyValidator.prototype={init:function(validators,catalog){this.catalog=catalog;for(var name in validators)
this.addValidator(name,validators[name].fn,validators[name].priority,validators[name].requirementsTransformer);$.emit('parsley:validator:init');}, setLocale:function(locale){if('undefined'===typeof this.catalog[locale])
throw new Error(locale+' is not available in the catalog');this.locale=locale;return this;},addCatalog:function(locale,messages,set){if('object'===typeof messages)
this.catalog[locale]=messages;if(true===set)
return this.setLocale(locale);return this;}, addMessage:function(locale,name,message){if('undefined'===typeof this.catalog[locale])
this.catalog[locale]={};this.catalog[locale][name.toLowerCase()]=message;return this;},validate:function(value,constraints,priority){return new this.Validator.Validator().validate.apply(new Validator.Validator(),arguments);}, addValidator:function(name,fn,priority,requirementsTransformer){this.validators[name.toLowerCase()]=function(requirements){return $.extend(new Validator.Assert().Callback(fn,requirements),{priority:priority,requirementsTransformer:requirementsTransformer});};return this;},updateValidator:function(name,fn,priority,requirementsTransformer){return this.addValidator(name,fn,priority,requirementsTransformer);},removeValidator:function(name){delete this.validators[name];return this;},getErrorMessage:function(constraint){var message; if('type'===constraint.name)
message=this.catalog[this.locale][constraint.name][constraint.requirements];else
message=this.formatMessage(this.catalog[this.locale][constraint.name],constraint.requirements);return''!==message?message:this.catalog[this.locale].defaultMessage;}, formatMessage:function(string,parameters){if('object'===typeof parameters){for(var i in parameters)
string=this.formatMessage(string,parameters[i]);return string;}
return'string'===typeof string?string.replace(new RegExp('%s','i'),parameters):'';},
 validators:{notblank:function(){return $.extend(new Validator.Assert().NotBlank(),{priority:2});},required:function(){return $.extend(new Validator.Assert().Required(),{priority:512});},type:function(type){var assert;switch(type){case'email':assert=new Validator.Assert().Email();break; case'range':case'number':assert=new Validator.Assert().Regexp('^-?(?:\\d+|\\d{1,3}(?:,\\d{3})+)?(?:\\.\\d+)?$');break;case'integer':assert=new Validator.Assert().Regexp('^-?\\d+$');break;case'digits':assert=new Validator.Assert().Regexp('^\\d+$');break;case'alphanum':assert=new Validator.Assert().Regexp('^\\w+$','i');break;case'url':assert=new Validator.Assert().Regexp('(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,4}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)','i');break;default:throw new Error('validator type `'+type+'` is not supported');}
return $.extend(assert,{priority:256});},pattern:function(regexp){var flags=''; if(!!(/^\/.*\/(?:[gimy]*)$/.test(regexp))){ 
flags=regexp.replace(/.*\/([gimy]*)$/,'$1'); regexp=regexp.replace(new RegExp('^/(.*?)/'+flags+'$'),'$1');}
return $.extend(new Validator.Assert().Regexp(regexp,flags),{priority:64});},minlength:function(value){return $.extend(new Validator.Assert().Length({min:value}),{priority:30,requirementsTransformer:function(){return'string'===typeof value&&!isNaN(value)?parseInt(value,10):value;}});},maxlength:function(value){return $.extend(new Validator.Assert().Length({max:value}),{priority:30,requirementsTransformer:function(){return'string'===typeof value&&!isNaN(value)?parseInt(value,10):value;}});},length:function(array){return $.extend(new Validator.Assert().Length({min:array[0],max:array[1]}),{priority:32});},mincheck:function(length){return this.minlength(length);},maxcheck:function(length){return this.maxlength(length);},check:function(array){return this.length(array);},min:function(value){return $.extend(new Validator.Assert().GreaterThanOrEqual(value),{priority:30,requirementsTransformer:function(){return'string'===typeof value&&!isNaN(value)?parseInt(value,10):value;}});},max:function(value){return $.extend(new Validator.Assert().LessThanOrEqual(value),{priority:30,requirementsTransformer:function(){return'string'===typeof value&&!isNaN(value)?parseInt(value,10):value;}});},range:function(array){return $.extend(new Validator.Assert().Range(array[0],array[1]),{priority:32,requirementsTransformer:function(){for(var i=0;i<array.length;i++)
array[i]='string'===typeof array[i]&&!isNaN(array[i])?parseInt(array[i],10):array[i];return array;}});},equalto:function(value){return $.extend(new Validator.Assert().EqualTo(value),{priority:256,requirementsTransformer:function(){return $(value).length?$(value).val():value;}});}}};var ParsleyUI=function(options){this.__class__='ParsleyUI';};ParsleyUI.prototype={listen:function(){$.listen('parsley:form:init',this,this.setupForm);$.listen('parsley:field:init',this,this.setupField);$.listen('parsley:field:validated',this,this.reflow);$.listen('parsley:form:validated',this,this.focus);$.listen('parsley:field:reset',this,this.reset);$.listen('parsley:form:destroy',this,this.destroy);$.listen('parsley:field:destroy',this,this.destroy);return this;},reflow:function(fieldInstance){ if('undefined'===typeof fieldInstance._ui||false===fieldInstance._ui.active)
return; var diff=this._diff(fieldInstance.validationResult,fieldInstance._ui.lastValidationResult); fieldInstance._ui.lastValidationResult=fieldInstance.validationResult;fieldInstance._ui.validatedOnce=true; this.manageStatusClass(fieldInstance); this.manageErrorsMessages(fieldInstance,diff); this.actualizeTriggers(fieldInstance); if((diff.kept.length||diff.added.length)&&'undefined'===typeof fieldInstance._ui.failedOnce)
this.manageFailingFieldTrigger(fieldInstance);},getErrorsMessages:function(fieldInstance){ if(true===fieldInstance.validationResult)
return[];var messages=[];for(var i=0;i<fieldInstance.validationResult.length;i++)
messages.push(this._getErrorMessage(fieldInstance,fieldInstance.validationResult[i].assert));return messages;},manageStatusClass:function(fieldInstance){if(true===fieldInstance.validationResult)
this._successClass(fieldInstance);else if(fieldInstance.validationResult.length>0)
this._errorClass(fieldInstance);else
this._resetClass(fieldInstance);},manageErrorsMessages:function(fieldInstance,diff){if('undefined'!==typeof fieldInstance.options.errorsMessagesDisabled)
return; if('undefined'!==typeof fieldInstance.options.errorMessage){if((diff.added.length||diff.kept.length)){if(0===fieldInstance._ui.$errorsWrapper.find('.parsley-custom-error-message').length)
fieldInstance._ui.$errorsWrapper.append($(fieldInstance.options.errorTemplate).addClass('parsley-custom-error-message'));return fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-custom-error-message').html(fieldInstance.options.errorMessage);}
return fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-custom-error-message').remove();} 
for(var i=0;i<diff.removed.length;i++)
this.removeError(fieldInstance,diff.removed[i].assert.name,true);for(i=0;i<diff.added.length;i++)
this.addError(fieldInstance,diff.added[i].assert.name,undefined,diff.added[i].assert,true);for(i=0;i<diff.kept.length;i++)
this.updateError(fieldInstance,diff.kept[i].assert.name,undefined,diff.kept[i].assert,true);},
addError:function(fieldInstance,name,message,assert,doNotUpdateClass){fieldInstance._ui.$errorsWrapper.addClass('filled').append($(fieldInstance.options.errorTemplate).addClass('parsley-'+name).html(message||this._getErrorMessage(fieldInstance,assert)));if(true!==doNotUpdateClass)
this._errorClass(fieldInstance);}, updateError:function(fieldInstance,name,message,assert,doNotUpdateClass){fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-'+name).html(message||this._getErrorMessage(fieldInstance,assert));if(true!==doNotUpdateClass)
this._errorClass(fieldInstance);}, removeError:function(fieldInstance,name,doNotUpdateClass){fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-'+name).remove();
if(true!==doNotUpdateClass)
this.manageStatusClass(fieldInstance);},focus:function(formInstance){if(true===formInstance.validationResult||'none'===formInstance.options.focus)
return formInstance._focusedField=null;formInstance._focusedField=null;for(var i=0;i<formInstance.fields.length;i++)
if(true!==formInstance.fields[i].validationResult&&formInstance.fields[i].validationResult.length>0&&'undefined'===typeof formInstance.fields[i].options.noFocus){if('first'===formInstance.options.focus){formInstance._focusedField=formInstance.fields[i].$element;return formInstance._focusedField.focus();}
formInstance._focusedField=formInstance.fields[i].$element;}
if(null===formInstance._focusedField)
return null;return formInstance._focusedField.focus();},_getErrorMessage:function(fieldInstance,constraint){var customConstraintErrorMessage=constraint.name+'Message';if('undefined'!==typeof fieldInstance.options[customConstraintErrorMessage])
return window.ParsleyValidator.formatMessage(fieldInstance.options[customConstraintErrorMessage],constraint.requirements);return window.ParsleyValidator.getErrorMessage(constraint);},_diff:function(newResult,oldResult,deep){var
added=[],kept=[];for(var i=0;i<newResult.length;i++){var found=false;for(var j=0;j<oldResult.length;j++)
if(newResult[i].assert.name===oldResult[j].assert.name){found=true;break;}
if(found)
kept.push(newResult[i]);else
added.push(newResult[i]);}
return{kept:kept,added:added,removed:!deep?this._diff(oldResult,newResult,true).added:[]};},setupForm:function(formInstance){formInstance.$element.on('submit.Parsley',false,$.proxy(formInstance.onSubmitValidate,formInstance)); if(false===formInstance.options.uiEnabled)
return;formInstance.$element.attr('novalidate','');},setupField:function(fieldInstance){var _ui={active:false}; if(false===fieldInstance.options.uiEnabled)
return;_ui.active=true; fieldInstance.$element.attr(fieldInstance.options.namespace+'id',fieldInstance.__id__); _ui.$errorClassHandler=this._manageClassHandler(fieldInstance); _ui.errorsWrapperId='parsley-id-'+('undefined'!==typeof fieldInstance.options.multiple?'multiple-'+fieldInstance.options.multiple:fieldInstance.__id__);_ui.$errorsWrapper=$(fieldInstance.options.errorsWrapper).attr('id',_ui.errorsWrapperId); _ui.lastValidationResult=[];_ui.validatedOnce=false;_ui.validationInformationVisible=false; fieldInstance._ui=_ui; if(!fieldInstance.$element.is(fieldInstance.options.excluded)){this._insertErrorWrapper(fieldInstance);} 
this.actualizeTriggers(fieldInstance);}, _manageClassHandler:function(fieldInstance){if('string'===typeof fieldInstance.options.classHandler&&$(fieldInstance.options.classHandler).length)
return $(fieldInstance.options.classHandler); var $handler=fieldInstance.options.classHandler(fieldInstance); if('undefined'!==typeof $handler&&$handler.length)
return $handler; if('undefined'===typeof fieldInstance.options.multiple||fieldInstance.$element.is('select'))
return fieldInstance.$element; return fieldInstance.$element.parent();},_insertErrorWrapper:function(fieldInstance){var $errorsContainer;if('string'===typeof fieldInstance.options.errorsContainer){if($(fieldInstance.options.errorsContainer).length)
return $(fieldInstance.options.errorsContainer).append(fieldInstance._ui.$errorsWrapper);else if(window.console&&window.console.warn)
window.console.warn('The errors container `'+fieldInstance.options.errorsContainer+'` does not exist in DOM');}
else if('function'===typeof fieldInstance.options.errorsContainer)
$errorsContainer=fieldInstance.options.errorsContainer(fieldInstance);if('undefined'!==typeof $errorsContainer&&$errorsContainer.length)
return $errorsContainer.append(fieldInstance._ui.$errorsWrapper);return'undefined'===typeof fieldInstance.options.multiple?fieldInstance.$element.after(fieldInstance._ui.$errorsWrapper):fieldInstance.$element.parent().after(fieldInstance._ui.$errorsWrapper);},actualizeTriggers:function(fieldInstance){var that=this; if(fieldInstance.options.multiple)
$('['+fieldInstance.options.namespace+'multiple="'+fieldInstance.options.multiple+'"]').each(function(){$(this).off('.Parsley');});else
fieldInstance.$element.off('.Parsley'); if(false===fieldInstance.options.trigger)
return;var triggers=fieldInstance.options.trigger.replace(/^\s+/g,'').replace(/\s+$/g,'');if(''===triggers)
return; if(fieldInstance.options.multiple)
$('['+fieldInstance.options.namespace+'multiple="'+fieldInstance.options.multiple+'"]').each(function(){$(this).on(triggers.split(' ').join('.Parsley ')+'.Parsley',false,$.proxy('function'===typeof fieldInstance.eventValidate?fieldInstance.eventValidate:that.eventValidate,fieldInstance));});else
fieldInstance.$element.on(triggers.split(' ').join('.Parsley ')+'.Parsley',false,$.proxy('function'===typeof fieldInstance.eventValidate?fieldInstance.eventValidate:this.eventValidate,fieldInstance));}, eventValidate:function(event){

if(new RegExp('key').test(event.type))
if(!this._ui.validationInformationVisible&&this.getValue().length<=this.options.validationThreshold)
return;this._ui.validatedOnce=true;this.validate();},manageFailingFieldTrigger:function(fieldInstance){fieldInstance._ui.failedOnce=true; if(fieldInstance.options.multiple)
$('['+fieldInstance.options.namespace+'multiple="'+fieldInstance.options.multiple+'"]').each(function(){if(!new RegExp('change','i').test($(this).parsley().options.trigger||''))
return $(this).on('change.ParsleyFailedOnce',false,$.proxy(fieldInstance.validate,fieldInstance));}); if(fieldInstance.$element.is('select'))
if(!new RegExp('change','i').test(fieldInstance.options.trigger||''))
return fieldInstance.$element.on('change.ParsleyFailedOnce',false,$.proxy(fieldInstance.validate,fieldInstance)); if(!new RegExp('keyup','i').test(fieldInstance.options.trigger||''))
return fieldInstance.$element.on('keyup.ParsleyFailedOnce',false,$.proxy(fieldInstance.validate,fieldInstance));},reset:function(parsleyInstance){ parsleyInstance.$element.off('.Parsley');parsleyInstance.$element.off('.ParsleyFailedOnce'); if('undefined'===typeof parsleyInstance._ui)
return;if('ParsleyForm'===parsleyInstance.__class__)
return; parsleyInstance._ui.$errorsWrapper.removeClass('filled').children().remove(); this._resetClass(parsleyInstance); parsleyInstance._ui.validatedOnce=false;parsleyInstance._ui.lastValidationResult=[];parsleyInstance._ui.validationInformationVisible=false;},destroy:function(parsleyInstance){this.reset(parsleyInstance);if('ParsleyForm'===parsleyInstance.__class__)
return;if('undefined'!==typeof parsleyInstance._ui)
parsleyInstance._ui.$errorsWrapper.remove();delete parsleyInstance._ui;},_successClass:function(fieldInstance){fieldInstance._ui.validationInformationVisible=true;fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.errorClass).addClass(fieldInstance.options.successClass);},_errorClass:function(fieldInstance){fieldInstance._ui.validationInformationVisible=true;fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).addClass(fieldInstance.options.errorClass);},_resetClass:function(fieldInstance){fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).removeClass(fieldInstance.options.errorClass);}};var ParsleyOptionsFactory=function(defaultOptions,globalOptions,userOptions,namespace){this.__class__='OptionsFactory';this.__id__=ParsleyUtils.hash(4);this.formOptions=null;this.fieldOptions=null;this.staticOptions=$.extend(true,{},defaultOptions,globalOptions,userOptions,{namespace:namespace});};ParsleyOptionsFactory.prototype={get:function(parsleyInstance){if('undefined'===typeof parsleyInstance.__class__)
throw new Error('Parsley Instance expected');switch(parsleyInstance.__class__){case'Parsley':return this.staticOptions;case'ParsleyForm':return this.getFormOptions(parsleyInstance);case'ParsleyField':case'ParsleyFieldMultiple':return this.getFieldOptions(parsleyInstance);default:throw new Error('Instance '+parsleyInstance.__class__+' is not supported');}},getFormOptions:function(formInstance){this.formOptions=ParsleyUtils.attr(formInstance.$element,this.staticOptions.namespace); return $.extend({},this.staticOptions,this.formOptions);},getFieldOptions:function(fieldInstance){this.fieldOptions=ParsleyUtils.attr(fieldInstance.$element,this.staticOptions.namespace);if(null===this.formOptions&&'undefined'!==typeof fieldInstance.parent)
this.formOptions=this.getFormOptions(fieldInstance.parent); return $.extend({},this.staticOptions,this.formOptions,this.fieldOptions);}};var ParsleyForm=function(element,OptionsFactory){this.__class__='ParsleyForm';this.__id__=ParsleyUtils.hash(4);if('OptionsFactory'!==ParsleyUtils.get(OptionsFactory,'__class__'))
throw new Error('You must give an OptionsFactory instance');this.OptionsFactory=OptionsFactory;this.$element=$(element);this.validationResult=null;this.options=this.OptionsFactory.get(this);};ParsleyForm.prototype={onSubmitValidate:function(event){this.validate(undefined,undefined,event); if(false===this.validationResult&&event instanceof $.Event){event.stopImmediatePropagation();event.preventDefault();}
return this;}, validate:function(group,force,event){this.submitEvent=event;this.validationResult=true;var fieldValidationResult=[]; this._refreshFields();$.emit('parsley:form:validate',this); for(var i=0;i<this.fields.length;i++){ if(group&&!this._isFieldInGroup(this.fields[i],group))
continue;fieldValidationResult=this.fields[i].validate(force);if(true!==fieldValidationResult&&fieldValidationResult.length>0&&this.validationResult)
this.validationResult=false;}
$.emit('parsley:form:validated',this);return this.validationResult;}, isValid:function(group,force){this._refreshFields();for(var i=0;i<this.fields.length;i++){ if(group&&!this._isFieldInGroup(this.fields[i],group))
continue;if(false===this.fields[i].isValid(force))
return false;}
return true;},_isFieldInGroup:function(field,group){if(ParsleyUtils.isArray(field.options.group))
return-1!==$.inArray(group,field.options.group);return field.options.group===group;},_refreshFields:function(){return this.actualizeOptions()._bindFields();},_bindFields:function(){var self=this;this.fields=[];this.fieldsMappedById={};this.$element.find(this.options.inputs).each(function(){var fieldInstance=new window.Parsley(this,{},self); if(('ParsleyField'===fieldInstance.__class__||'ParsleyFieldMultiple'===fieldInstance.__class__)&&!fieldInstance.$element.is(fieldInstance.options.excluded))
if('undefined'===typeof self.fieldsMappedById[fieldInstance.__class__+'-'+fieldInstance.__id__]){self.fieldsMappedById[fieldInstance.__class__+'-'+fieldInstance.__id__]=fieldInstance;self.fields.push(fieldInstance);}});return this;}};var ConstraintFactory=function(parsleyField,name,requirements,priority,isDomConstraint){if(!new RegExp('ParsleyField').test(ParsleyUtils.get(parsleyField,'__class__')))
throw new Error('ParsleyField or ParsleyFieldMultiple instance expected');if('function'!==typeof window.ParsleyValidator.validators[name]&&'Assert'!==window.ParsleyValidator.validators[name](requirements).__parentClass__)
throw new Error('Valid validator expected');var getPriority=function(parsleyField,name){if('undefined'!==typeof parsleyField.options[name+'Priority'])
return parsleyField.options[name+'Priority'];return ParsleyUtils.get(window.ParsleyValidator.validators[name](requirements),'priority')||2;};priority=priority||getPriority(parsleyField,name); if('function'===typeof window.ParsleyValidator.validators[name](requirements).requirementsTransformer)
requirements=window.ParsleyValidator.validators[name](requirements).requirementsTransformer();return $.extend(window.ParsleyValidator.validators[name](requirements),{name:name,requirements:requirements,priority:priority,groups:[priority],isDomConstraint:isDomConstraint||ParsleyUtils.attr(parsleyField.$element,parsleyField.options.namespace,name)});};var ParsleyField=function(field,OptionsFactory,parsleyFormInstance){this.__class__='ParsleyField';this.__id__=ParsleyUtils.hash(4);this.$element=$(field); if('undefined'!==typeof parsleyFormInstance){this.parent=parsleyFormInstance;this.OptionsFactory=this.parent.OptionsFactory;this.options=this.OptionsFactory.get(this);}else{this.OptionsFactory=OptionsFactory;this.options=this.OptionsFactory.get(this);} 
this.constraints=[];this.constraintsByName={};this.validationResult=[]; this._bindConstraints();};ParsleyField.prototype={

 
validate:function(force){this.value=this.getValue(); $.emit('parsley:field:validate',this);$.emit('parsley:field:'+(this.isValid(force,this.value)?'success':'error'),this); $.emit('parsley:field:validated',this);return this.validationResult;},
isValid:function(force,value){ this.refreshConstraints(); var priorities=this._getConstraintsSortedPriorities();if(0===priorities.length)
return this.validationResult=[];value=value||this.getValue();
 if(!value.length&&!this._isRequired()&&'undefined'===typeof this.options.validateIfEmpty&&true!==force)
return this.validationResult=[]; if(false===this.options.priorityEnabled)
return true===(this.validationResult=this.validateThroughValidator(value,this.constraints,'Any')); for(var i=0;i<priorities.length;i++)
if(true!==(this.validationResult=this.validateThroughValidator(value,this.constraints,priorities[i])))
return false;return true;}, getValue:function(){var value; if('undefined'!==typeof this.options.value)
value=this.options.value;else
value=this.$element.val(); if('undefined'===typeof value||null===value)
return''; if(true===this.options.trimValue)
return value.replace(/^\s+|\s+$/g,'');return value;},
refreshConstraints:function(){return this.actualizeOptions()._bindConstraints();},addConstraint:function(name,requirements,priority,isDomConstraint){name=name.toLowerCase();if('function'===typeof window.ParsleyValidator.validators[name]){var constraint=new ConstraintFactory(this,name,requirements,priority,isDomConstraint); if('undefined'!==this.constraintsByName[constraint.name])
this.removeConstraint(constraint.name);this.constraints.push(constraint);this.constraintsByName[constraint.name]=constraint;}
return this;}, removeConstraint:function(name){for(var i=0;i<this.constraints.length;i++)
if(name===this.constraints[i].name){this.constraints.splice(i,1);break;}
delete this.constraintsByName[name];return this;},updateConstraint:function(name,parameters,priority){return this.removeConstraint(name).addConstraint(name,parameters,priority);},
 _bindConstraints:function(){var constraints=[],constraintsByName={}; for(var i=0;i<this.constraints.length;i++)
if(false===this.constraints[i].isDomConstraint){constraints.push(this.constraints[i]);constraintsByName[this.constraints[i].name]=this.constraints[i];}
this.constraints=constraints;this.constraintsByName=constraintsByName; for(var name in this.options)
this.addConstraint(name,this.options[name]); return this._bindHtml5Constraints();}, _bindHtml5Constraints:function(){ if(this.$element.hasClass('required')||this.$element.attr('required'))
this.addConstraint('required',true,undefined,true); if('string'===typeof this.$element.attr('pattern'))
this.addConstraint('pattern',this.$element.attr('pattern'),undefined,true); if('undefined'!==typeof this.$element.attr('min')&&'undefined'!==typeof this.$element.attr('max'))
this.addConstraint('range',[this.$element.attr('min'),this.$element.attr('max')],undefined,true); else if('undefined'!==typeof this.$element.attr('min'))
this.addConstraint('min',this.$element.attr('min'),undefined,true); else if('undefined'!==typeof this.$element.attr('max'))
this.addConstraint('max',this.$element.attr('max'),undefined,true); var type=this.$element.attr('type');if('undefined'===typeof type)
return this; if('number'===type){if(('undefined'===typeof this.$element.attr('step'))||(0===parseFloat(this.$element.attr('step'))%1)){return this.addConstraint('type','integer',undefined,true);}else{return this.addConstraint('type','number',undefined,true);}
}else if(new RegExp(type,'i').test('email url range')){return this.addConstraint('type',type,undefined,true);}
return this;}, _isRequired:function(){if('undefined'===typeof this.constraintsByName.required)
return false;return false!==this.constraintsByName.required.requirements;}, _getConstraintsSortedPriorities:function(){var priorities=[]; for(var i=0;i<this.constraints.length;i++)
if(-1===priorities.indexOf(this.constraints[i].priority))
priorities.push(this.constraints[i].priority); priorities.sort(function(a,b){return b-a;});return priorities;}};var ParsleyMultiple=function(){this.__class__='ParsleyFieldMultiple';};ParsleyMultiple.prototype={ addElement:function($element){this.$elements.push($element);return this;},refreshConstraints:function(){var fieldConstraints;this.constraints=[]; if(this.$element.is('select')){this.actualizeOptions()._bindConstraints();return this;} 
for(var i=0;i<this.$elements.length;i++){ if(!$('html').has(this.$elements[i]).length){this.$elements.splice(i,1);continue;}
fieldConstraints=this.$elements[i].data('ParsleyFieldMultiple').refreshConstraints().constraints;for(var j=0;j<fieldConstraints.length;j++)
this.addConstraint(fieldConstraints[j].name,fieldConstraints[j].requirements,fieldConstraints[j].priority,fieldConstraints[j].isDomConstraint);}
return this;},getValue:function(){ if('undefined'!==typeof this.options.value)
return this.options.value; if(this.$element.is('input[type=radio]'))
return $('['+this.options.namespace+'multiple="'+this.options.multiple+'"]:checked').val()||''; if(this.$element.is('input[type=checkbox]')){var values=[];$('['+this.options.namespace+'multiple="'+this.options.multiple+'"]:checked').each(function(){values.push($(this).val());});return values.length?values:[];} 
if(this.$element.is('select')&&null===this.$element.val())
return[]; return this.$element.val();},_init:function(multiple){this.$elements=[this.$element];this.options.multiple=multiple;return this;}};var
o=$({}),subscribed={};$.listen=function(name){if('undefined'===typeof subscribed[name])
subscribed[name]=[];if('function'===typeof arguments[1])
return subscribed[name].push({fn:arguments[1]});if('object'===typeof arguments[1]&&'function'===typeof arguments[2])
return subscribed[name].push({fn:arguments[2],ctxt:arguments[1]});throw new Error('Wrong parameters');};$.listenTo=function(instance,name,fn){if('undefined'===typeof subscribed[name])
subscribed[name]=[];if(!(instance instanceof ParsleyField)&&!(instance instanceof ParsleyForm))
throw new Error('Must give Parsley instance');if('string'!==typeof name||'function'!==typeof fn)
throw new Error('Wrong parameters');subscribed[name].push({instance:instance,fn:fn});};$.unsubscribe=function(name,fn){if('undefined'===typeof subscribed[name])
return;if('string'!==typeof name||'function'!==typeof fn)
throw new Error('Wrong arguments');for(var i=0;i<subscribed[name].length;i++)
if(subscribed[name][i].fn===fn)
return subscribed[name].splice(i,1);};$.unsubscribeTo=function(instance,name){if('undefined'===typeof subscribed[name])
return;if(!(instance instanceof ParsleyField)&&!(instance instanceof ParsleyForm))
throw new Error('Must give Parsley instance');for(var i=0;i<subscribed[name].length;i++)
if('undefined'!==typeof subscribed[name][i].instance&&subscribed[name][i].instance.__id__===instance.__id__)
return subscribed[name].splice(i,1);};$.unsubscribeAll=function(name){if('undefined'===typeof subscribed[name])
return;delete subscribed[name];};$.emit=function(name,instance){if('undefined'===typeof subscribed[name])
return; for(var i=0;i<subscribed[name].length;i++){ if('undefined'===typeof subscribed[name][i].instance){subscribed[name][i].fn.apply('undefined'!==typeof subscribed[name][i].ctxt?subscribed[name][i].ctxt:o,Array.prototype.slice.call(arguments,1));continue;} 
if(!(instance instanceof ParsleyField)&&!(instance instanceof ParsleyForm))
continue; if(subscribed[name][i].instance.__id__===instance.__id__){subscribed[name][i].fn.apply(o,Array.prototype.slice.call(arguments,1));continue;} 
if(subscribed[name][i].instance instanceof ParsleyForm&&instance instanceof ParsleyField)
for(var j=0;j<subscribed[name][i].instance.fields.length;j++)
if(subscribed[name][i].instance.fields[j].__id__===instance.__id__){subscribed[name][i].fn.apply(o,Array.prototype.slice.call(arguments,1));continue;}}};$.subscribed=function(){return subscribed;};window.ParsleyConfig=window.ParsleyConfig||{};window.ParsleyConfig.i18n=window.ParsleyConfig.i18n||{};window.ParsleyConfig.i18n.en=$.extend(window.ParsleyConfig.i18n.en||{},{defaultMessage:"This value seems to be invalid.",type:{email:"This value should be a valid email.",url:"This value should be a valid url.",number:"This value should be a valid number.",integer:"This value should be a valid integer.",digits:"This value should be digits.",alphanum:"This value should be alphanumeric."},notblank:"This value should not be blank.",required:"This value is required.",pattern:"This value seems to be invalid.",min:"This value should be greater than or equal to %s.",max:"This value should be lower than or equal to %s.",range:"This value should be between %s and %s.",minlength:"This value is too short. It should have %s characters or more.",maxlength:"This value is too long. It should have %s characters or fewer.",length:"This value length is invalid. It should be between %s and %s characters long.",mincheck:"You must select at least %s choices.",maxcheck:"You must select %s choices or fewer.",check:"You must select between %s and %s choices.",equalto:"This value should be the same."});if('undefined'!==typeof window.ParsleyValidator)
window.ParsleyValidator.addCatalog('en',window.ParsleyConfig.i18n.en,true);


 var Parsley=function(element,options,parsleyFormInstance){this.__class__='Parsley';this.__version__='2.0.6';this.__id__=ParsleyUtils.hash(4); if('undefined'===typeof element)
throw new Error('You must give an element');if('undefined'!==typeof parsleyFormInstance&&'ParsleyForm'!==parsleyFormInstance.__class__)
throw new Error('Parent instance must be a ParsleyForm instance');return this.init($(element),options,parsleyFormInstance);};Parsley.prototype={init:function($element,options,parsleyFormInstance){if(!$element.length)
throw new Error('You must bind Parsley on an existing element.');this.$element=$element; if(this.$element.data('Parsley')){var savedparsleyFormInstance=this.$element.data('Parsley'); if('undefined'!==typeof parsleyFormInstance)
savedparsleyFormInstance.parent=parsleyFormInstance;return savedparsleyFormInstance;} 
this.OptionsFactory=new ParsleyOptionsFactory(ParsleyDefaults,ParsleyUtils.get(window,'ParsleyConfig')||{},options,this.getNamespace(options));this.options=this.OptionsFactory.get(this); if(this.$element.is('form')||(ParsleyUtils.attr(this.$element,this.options.namespace,'validate')&&!this.$element.is(this.options.inputs)))
return this.bind('parsleyForm');else if(this.$element.is(this.options.inputs)&&!this.$element.is(this.options.excluded))
return this.isMultiple()?this.handleMultiple(parsleyFormInstance):this.bind('parsleyField',parsleyFormInstance);return this;},isMultiple:function(){return(this.$element.is('input[type=radio], input[type=checkbox]')&&'undefined'===typeof this.options.multiple)||(this.$element.is('select')&&'undefined'!==typeof this.$element.attr('multiple'));},handleMultiple:function(parsleyFormInstance){var
that=this,name,multiple,parsleyMultipleInstance; this.options=$.extend(this.options,parsleyFormInstance?parsleyFormInstance.OptionsFactory.get(parsleyFormInstance):{},ParsleyUtils.attr(this.$element,this.options.namespace)); if(this.options.multiple)
multiple=this.options.multiple;else if('undefined'!==typeof this.$element.attr('name')&&this.$element.attr('name').length)
multiple=name=this.$element.attr('name');else if('undefined'!==typeof this.$element.attr('id')&&this.$element.attr('id').length)
multiple=this.$element.attr('id'); if(this.$element.is('select')&&'undefined'!==typeof this.$element.attr('multiple')){return this.bind('parsleyFieldMultiple',parsleyFormInstance,multiple||this.__id__);}else if('undefined'===typeof multiple){if(window.console&&window.console.warn)
window.console.warn('To be binded by Parsley, a radio, a checkbox and a multiple select input must have either a name or a multiple option.',this.$element);return this;} 
multiple=multiple.replace(/(:|\.|\[|\]|\{|\}|\$)/g,''); if('undefined'!==typeof name){$('input[name="'+name+'"]').each(function(){if($(this).is('input[type=radio], input[type=checkbox]'))
$(this).attr(that.options.namespace+'multiple',multiple);});} 
if($('['+this.options.namespace+'multiple='+multiple+']').length){for(var i=0;i<$('['+this.options.namespace+'multiple='+multiple+']').length;i++){if('undefined'!==typeof $($('['+this.options.namespace+'multiple='+multiple+']').get(i)).data('Parsley')){parsleyMultipleInstance=$($('['+this.options.namespace+'multiple='+multiple+']').get(i)).data('Parsley');if(!this.$element.data('ParsleyFieldMultiple')){parsleyMultipleInstance.addElement(this.$element);this.$element.attr(this.options.namespace+'id',parsleyMultipleInstance.__id__);}
break;}}} 
this.bind('parsleyField',parsleyFormInstance,multiple,true);return parsleyMultipleInstance||this.bind('parsleyFieldMultiple',parsleyFormInstance,multiple);}, getNamespace:function(options){if('undefined'!==typeof this.$element.data('parsleyNamespace'))
return this.$element.data('parsleyNamespace');if('undefined'!==typeof ParsleyUtils.get(options,'namespace'))
return options.namespace;if('undefined'!==typeof ParsleyUtils.get(window,'ParsleyConfig.namespace'))
return window.ParsleyConfig.namespace;return ParsleyDefaults.namespace;},bind:function(type,parentParsleyFormInstance,multiple,doNotStore){var parsleyInstance;switch(type){case'parsleyForm':parsleyInstance=$.extend(new ParsleyForm(this.$element,this.OptionsFactory),new ParsleyAbstract(),window.ParsleyExtend)._bindFields();break;case'parsleyField':parsleyInstance=$.extend(new ParsleyField(this.$element,this.OptionsFactory,parentParsleyFormInstance),new ParsleyAbstract(),window.ParsleyExtend);break;case'parsleyFieldMultiple':parsleyInstance=$.extend(new ParsleyField(this.$element,this.OptionsFactory,parentParsleyFormInstance),new ParsleyAbstract(),new ParsleyMultiple(),window.ParsleyExtend)._init(multiple);break;default:throw new Error(type+'is not a supported Parsley type');}
if('undefined'!==typeof multiple)
ParsleyUtils.setAttr(this.$element,this.options.namespace,'multiple',multiple);if('undefined'!==typeof doNotStore){this.$element.data('ParsleyFieldMultiple',parsleyInstance);return parsleyInstance;}
if(new RegExp('ParsleyF','i').test(parsleyInstance.__class__)){this.$element.data('Parsley',parsleyInstance);$.emit('parsley:'+('parsleyForm'===type?'form':'field')+':init',parsleyInstance);}
return parsleyInstance;}};
$.fn.parsley=$.fn.psly=function(options){if(this.length>1){var instances=[];this.each(function(){instances.push($(this).parsley(options));});return instances;} 
if(!$(this).length){if(window.console&&window.console.warn)
window.console.warn('You must bind Parsley on an existing element.');return;}
return new Parsley(this,options);};

window.ParsleyUI='function'===typeof ParsleyUtils.get(window,'ParsleyConfig.ParsleyUI')?new window.ParsleyConfig.ParsleyUI().listen():new ParsleyUI().listen();
 if('undefined'===typeof window.ParsleyExtend)
window.ParsleyExtend={};
 if('undefined'===typeof window.ParsleyConfig)
window.ParsleyConfig={}; window.Parsley=window.psly=Parsley;window.ParsleyUtils=ParsleyUtils;window.ParsleyValidator=new ParsleyValidator(window.ParsleyConfig.validators,window.ParsleyConfig.i18n);
if(false!==ParsleyUtils.get(window,'ParsleyConfig.autoBind'))
$(function(){if($('[data-parsley-validate]').length)
$('[data-parsley-validate]').parsley();});}));(function(){var $,cardFromNumber,cardFromType,cards,defaultFormat,formatBackCardNumber,formatBackExpiry,formatCardNumber,formatExpiry,formatForwardExpiry,formatForwardSlashAndSpace,hasTextSelected,luhnCheck,reFormatCardNumber,reFormatExpiry,restrictCVC,restrictCardNumber,restrictExpiry,restrictNumeric,setCardType,__slice=[].slice,__indexOf=[].indexOf||function(item){for(var i=0,l=this.length;i<l;i++){if(i in this&&this[i]===item)return i;}return-1;};$=jQuery;$.payment={};$.payment.fn={};$.fn.payment=function(){var args,method;method=arguments[0],args=2<=arguments.length?__slice.call(arguments,1):[];return $.payment.fn[method].apply(this,args);};defaultFormat=/(\d{1,4})/g;cards=[{type:'visaelectron',pattern:/^4(026|17500|405|508|844|91[37])/,format:defaultFormat,length:[16],cvcLength:[3],luhn:true},{type:'maestro',pattern:/^(5(018|0[23]|[68])|6(39|7))/,format:defaultFormat,length:[12,13,14,15,16,17,18,19],cvcLength:[3],luhn:true},{type:'forbrugsforeningen',pattern:/^600/,format:defaultFormat,length:[16],cvcLength:[3],luhn:true},{type:'dankort',pattern:/^5019/,format:defaultFormat,length:[16],cvcLength:[3],luhn:true},{type:'visa',pattern:/^4/,format:defaultFormat,length:[13,16],cvcLength:[3],luhn:true},{type:'mastercard',pattern:/^5[0-5]/,format:defaultFormat,length:[16],cvcLength:[3],luhn:true},{type:'amex',pattern:/^3[47]/,format:/(\d{1,4})(\d{1,6})?(\d{1,5})?/,length:[15],cvcLength:[3,4],luhn:true},{type:'dinersclub',pattern:/^3[0689]/,format:defaultFormat,length:[14],cvcLength:[3],luhn:true},{type:'discover',pattern:/^6([045]|22)/,format:defaultFormat,length:[16],cvcLength:[3],luhn:true},{type:'unionpay',pattern:/^(62|88)/,format:defaultFormat,length:[16,17,18,19],cvcLength:[3],luhn:false},{type:'jcb',pattern:/^35/,format:defaultFormat,length:[16],cvcLength:[3],luhn:true}];cardFromNumber=function(num){var card,_i,_len;num=(num+'').replace(/\D/g,'');for(_i=0,_len=cards.length;_i<_len;_i++){card=cards[_i];if(card.pattern.test(num)){return card;}}};cardFromType=function(type){var card,_i,_len;for(_i=0,_len=cards.length;_i<_len;_i++){card=cards[_i];if(card.type===type){return card;}}};luhnCheck=function(num){var digit,digits,odd,sum,_i,_len;odd=true;sum=0;digits=(num+'').split('').reverse();for(_i=0,_len=digits.length;_i<_len;_i++){digit=digits[_i];digit=parseInt(digit,10);if((odd=!odd)){digit*=2;}
if(digit>9){digit-=9;}
sum+=digit;}
return sum%10===0;};hasTextSelected=function($target){var _ref;if(($target.prop('selectionStart')!=null)&&$target.prop('selectionStart')!==$target.prop('selectionEnd')){return true;}
if(typeof document!=="undefined"&&document!==null?(_ref=document.selection)!=null?typeof _ref.createRange==="function"?_ref.createRange().text:void 0:void 0:void 0){return true;}
return false;};reFormatCardNumber=function(e){return setTimeout(function(){var $target,value;$target=$(e.currentTarget);value=$target.val();value=$.payment.formatCardNumber(value);return $target.val(value);});};formatCardNumber=function(e){var $target,card,digit,length,re,upperLength,value;digit=String.fromCharCode(e.which);if(!/^\d+$/.test(digit)){return;}
$target=$(e.currentTarget);value=$target.val();card=cardFromNumber(value+digit);length=(value.replace(/\D/g,'')+digit).length;upperLength=16;if(card){upperLength=card.length[card.length.length-1];}
if(length>=upperLength){return;}
if(($target.prop('selectionStart')!=null)&&$target.prop('selectionStart')!==value.length){return;}
if(card&&card.type==='amex'){re=/^(\d{4}|\d{4}\s\d{6})$/;}else{re=/(?:^|\s)(\d{4})$/;}
if(re.test(value)){e.preventDefault();return setTimeout(function(){return $target.val(value+' '+digit);});}else if(re.test(value+digit)){e.preventDefault();return setTimeout(function(){return $target.val(value+digit+' ');});}};formatBackCardNumber=function(e){var $target,value;$target=$(e.currentTarget);value=$target.val();if(e.which!==8){return;}
if(($target.prop('selectionStart')!=null)&&$target.prop('selectionStart')!==value.length){return;}
if(/\d\s$/.test(value)){e.preventDefault();return setTimeout(function(){return $target.val(value.replace(/\d\s$/,''));});}else if(/\s\d?$/.test(value)){e.preventDefault();return setTimeout(function(){return $target.val(value.replace(/\s\d?$/,''));});}};reFormatExpiry=function(e){return setTimeout(function(){var $target,value;$target=$(e.currentTarget);value=$target.val();value=$.payment.formatExpiry(value);return $target.val(value);});};formatExpiry=function(e){var $target,digit,val;digit=String.fromCharCode(e.which);if(!/^\d+$/.test(digit)){return;}
$target=$(e.currentTarget);val=$target.val()+digit;if(/^\d$/.test(val)&&(val!=='0'&&val!=='1')){e.preventDefault();return setTimeout(function(){return $target.val("0"+val+" / ");});}else if(/^\d\d$/.test(val)){e.preventDefault();return setTimeout(function(){return $target.val(""+val+" / ");});}};formatForwardExpiry=function(e){var $target,digit,val;digit=String.fromCharCode(e.which);if(!/^\d+$/.test(digit)){return;}
$target=$(e.currentTarget);val=$target.val();if(/^\d\d$/.test(val)){return $target.val(""+val+" / ");}};formatForwardSlashAndSpace=function(e){var $target,val,which;which=String.fromCharCode(e.which);if(!(which==='/'||which===' ')){return;}
$target=$(e.currentTarget);val=$target.val();if(/^\d$/.test(val)&&val!=='0'){return $target.val("0"+val+" / ");}};formatBackExpiry=function(e){var $target,value;$target=$(e.currentTarget);value=$target.val();if(e.which!==8){return;}
if(($target.prop('selectionStart')!=null)&&$target.prop('selectionStart')!==value.length){return;}
if(/\s\/\s\d?$/.test(value)){e.preventDefault();return setTimeout(function(){return $target.val(value.replace(/\s\/\s\d?$/,''));});}};restrictNumeric=function(e){var input;if(e.metaKey||e.ctrlKey){return true;}
if(e.which===32){return false;}
if(e.which===0){return true;}
if(e.which<33){return true;}
input=String.fromCharCode(e.which);return!!/[\d\s]/.test(input);};restrictCardNumber=function(e){var $target,card,digit,value;$target=$(e.currentTarget);digit=String.fromCharCode(e.which);if(!/^\d+$/.test(digit)){return;}
if(hasTextSelected($target)){return;}
value=($target.val()+digit).replace(/\D/g,'');card=cardFromNumber(value);if(card){return value.length<=card.length[card.length.length-1];}else{return value.length<=16;}};restrictExpiry=function(e){var $target,digit,value;$target=$(e.currentTarget);digit=String.fromCharCode(e.which);if(!/^\d+$/.test(digit)){return;}
if(hasTextSelected($target)){return;}
value=$target.val()+digit;value=value.replace(/\D/g,'');if(value.length>6){return false;}};restrictCVC=function(e){var $target,digit,val;$target=$(e.currentTarget);digit=String.fromCharCode(e.which);if(!/^\d+$/.test(digit)){return;}
if(hasTextSelected($target)){return;}
val=$target.val()+digit;return val.length<=4;};setCardType=function(e){var $target,allTypes,card,cardType,val;$target=$(e.currentTarget);val=$target.val();cardType=$.payment.cardType(val)||'unknown';if(!$target.hasClass(cardType)){allTypes=(function(){var _i,_len,_results;_results=[];for(_i=0,_len=cards.length;_i<_len;_i++){card=cards[_i];_results.push(card.type);}
return _results;})();$target.removeClass('unknown');$target.removeClass(allTypes.join(' '));$target.addClass(cardType);$target.toggleClass('identified',cardType!=='unknown');return $target.trigger('payment.cardType',cardType);}};$.payment.fn.formatCardCVC=function(){this.payment('restrictNumeric');this.on('keypress',restrictCVC);return this;};$.payment.fn.formatCardExpiry=function(){this.payment('restrictNumeric');this.on('keypress',restrictExpiry);this.on('keypress',formatExpiry);this.on('keypress',formatForwardSlashAndSpace);this.on('keypress',formatForwardExpiry);this.on('keydown',formatBackExpiry);this.on('change',reFormatExpiry);this.on('input',reFormatExpiry);return this;};$.payment.fn.formatCardNumber=function(){this.payment('restrictNumeric');this.on('keypress',restrictCardNumber);this.on('keypress',formatCardNumber);this.on('keydown',formatBackCardNumber);this.on('keyup',setCardType);this.on('paste',reFormatCardNumber);this.on('change',reFormatCardNumber);this.on('input',reFormatCardNumber);this.on('input',setCardType);return this;};$.payment.fn.restrictNumeric=function(){this.on('keypress',restrictNumeric);return this;};$.payment.fn.cardExpiryVal=function(){return $.payment.cardExpiryVal($(this).val());};$.payment.cardExpiryVal=function(value){var month,prefix,year,_ref;value=value.replace(/\s/g,'');_ref=value.split('/',2),month=_ref[0],year=_ref[1];if((year!=null?year.length:void 0)===2&&/^\d+$/.test(year)){prefix=(new Date).getFullYear();prefix=prefix.toString().slice(0,2);year=prefix+year;}
month=parseInt(month,10);year=parseInt(year,10);return{month:month,year:year};};$.payment.validateCardNumber=function(num){var card,_ref;num=(num+'').replace(/\s+|-/g,'');if(!/^\d+$/.test(num)){return false;}
card=cardFromNumber(num);if(!card){return false;}
return(_ref=num.length,__indexOf.call(card.length,_ref)>=0)&&(card.luhn===false||luhnCheck(num));};$.payment.validateCardExpiry=function(month,year){var currentTime,expiry,_ref;if(typeof month==='object'&&'month'in month){_ref=month,month=_ref.month,year=_ref.year;}
if(!(month&&year)){return false;}
month=$.trim(month);year=$.trim(year);if(!/^\d+$/.test(month)){return false;}
if(!/^\d+$/.test(year)){return false;}
if(!((1<=month&&month<=12))){return false;}
if(year.length===2){if(year<70){year="20"+year;}else{year="19"+year;}}
if(year.length!==4){return false;}
expiry=new Date(year,month);currentTime=new Date;expiry.setMonth(expiry.getMonth()-1);expiry.setMonth(expiry.getMonth()+1,1);return expiry>currentTime;};$.payment.validateCardCVC=function(cvc,type){var card,_ref;cvc=$.trim(cvc);if(!/^\d+$/.test(cvc)){return false;}
card=cardFromType(type);if(card!=null){return _ref=cvc.length,__indexOf.call(card.cvcLength,_ref)>=0;}else{return cvc.length>=3&&cvc.length<=4;}};$.payment.cardType=function(num){var _ref;if(!num){return null;}
return((_ref=cardFromNumber(num))!=null?_ref.type:void 0)||null;};$.payment.formatCardNumber=function(num){var card,groups,upperLength,_ref;card=cardFromNumber(num);if(!card){return num;}
upperLength=card.length[card.length.length-1];num=num.replace(/\D/g,'');num=num.slice(0,upperLength);if(card.format.global){return(_ref=num.match(card.format))!=null?_ref.join(' '):void 0;}else{groups=card.format.exec(num);if(groups==null){return;}
groups.shift();groups=$.grep(groups,function(n){return n;});return groups.join(' ');}};$.payment.formatExpiry=function(expiry){var mon,parts,sep,year;parts=expiry.match(/^\D*(\d{1,2})(\D+)?(\d{1,4})?/);if(!parts){return'';}
mon=parts[1]||'';sep=parts[2]||'';year=parts[3]||'';if(year.length>0||(sep.length>0&&!(/\ \/?\ ?/.test(sep)))){sep=' / ';}
if(mon.length===1&&(mon!=='0'&&mon!=='1')){mon="0"+mon;sep=' / ';}
return mon+sep+year;};}).call(this);Stripe.setPublishableKey('pk_test_7MmO7bkJvlkV0TfD1YfFcnVf');var csrftoken=$('meta[name=csrf-token]').attr('content');$.ajaxSetup({beforeSend:function(xhr,settings){if(!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)){xhr.setRequestHeader("X-CSRFToken",csrftoken)}}});var stripeResponseHandler=function(status,response){var $form=$('#purchase_form');if(response.error){ $form.find('.payment-errors').text(response.error.message);$form.find('input').prop('disabled',false);}else{ var token=response.id; $form.append($('<input type="hidden" name="stripeToken">').val(token)); $form.get(0).submit();}};$(document).ready(function(){ var couponCodeForm=$('#coupon_code_wrapper').hide(); $('.coupon_code_reveal').click(function(e){e.preventDefault();$(couponCodeForm).toggle();}); $('.cc-number').payment('formatCardNumber');$('.cc-exp').payment('formatCardExpiry');$('.cc-cvc').payment('formatCardCVC'); $.fn.toggleInputError=function(erred){this.parent('.form-group').toggleClass('has-error',erred);return this;}; var couponApplied=false; $('#purchase_form').submit(function(e){var $form=$(this); $form.find('button').prop('disabled',false); if(!couponApplied){e.preventDefault(); var cardType=$.payment.cardType($('.cc-number').val());$('.cc-number').toggleInputError(!$.payment.validateCardNumber($('.cc-number').val()));$('.cc-exp').toggleInputError(!$.payment.validateCardExpiry($('.cc-exp').payment('cardExpiryVal')));$('.cc-cvc').toggleInputError(!$.payment.validateCardCVC($('.cc-cvc').val(),cardType));$('.validation').removeClass('text-danger text-success');$('.validation').addClass($('.has-error').length?'text-danger':'text-success'); var exp=$('.cc-exp').val().split(' / ');Stripe.card.createToken({number:$('.cc-number').val(),cvc:$('.cc-cvc').val(),exp_month:exp[0],exp_year:exp[1]},stripeResponseHandler);}
return couponApplied;}); $('#couponcode_form').submit(function(){ var code=$('#coupon_code').val();$.ajax({data:JSON.stringify({code:code}),url:'/code_validate',type:'POST',contentType:"application/json; charset=utf-8",dataType:'json',success:function(json){ if(json.response.toLowerCase()=='code accepted!'){$(".validation_response").addClass('valid');}else if(json.response.toLowerCase()=='code already used!'||json.response.toLowerCase()=='invalid or missing code!'){$(".validation_response").addClass('invalid');}
$(".validation_response").text(json.response);$(".code_redemption").text(json.price); if(json.code_applied===true){couponApplied=true;$("#coupon_used").val(couponApplied);$("#payment, .payment_step").remove();}},error:function(request,errorType,errorMessage){console.log(errorType+": "+errorMessage);}});return false;}); $('.prefilled_message button').click(function(){ var prefilled_message=$(this).parent().find('.message').text(); var custom_message=$('#personal_message') 
$(custom_message).val(prefilled_message).blur(); $(document).scrollTop($("#message").offset().top-100);});});(function($){$.fn.equalHeight=function(){var heights=[];$.each(this,function(i,element){$element=$(element);var element_height;var includePadding=($element.css('box-sizing')=='border-box')||($element.css('-moz-box-sizing')=='border-box');if(includePadding){element_height=$element.innerHeight();}else{element_height=$element.height();}
heights.push(element_height);});this.height(Math.max.apply(window,heights));return this;};$.fn.equalHeightGrid=function(columns){var $tiles=this;$tiles.css('height','auto');for(var i=0;i<$tiles.length;i++){if(i%columns===0){var row=$($tiles[i]);for(var n=1;n<columns;n++){row=row.add($tiles[i+n]);}
row.equalHeight();}}
return this;};$.fn.detectGridColumns=function(){var offset=0,cols=0;this.each(function(i,elem){var elem_offset=$(elem).offset().top;if(offset===0||elem_offset==offset){cols++;offset=elem_offset;}else{return false;}});return cols;};$.fn.responsiveEqualHeightGrid=function(){var _this=this;function syncHeights(){var cols=_this.detectGridColumns();_this.equalHeightGrid(cols);}
$(window).bind('resize load',syncHeights);syncHeights();return this;};})(jQuery);(function($){$.fn.extend({limit:function(limit,element){var interval,f;var self=$(this);$(this).focus(function(){interval=window.setInterval(substring,100);});$(this).blur(function(){clearInterval(interval);substring();});substringFunction="function substring(){ var val = $(self).val();var length = val.length;if(length > limit){$(self).val($(self).val().substring(0,limit));}";if(typeof element!='undefined')
substringFunction+="if($(element).html() != limit-length){$(element).html((limit-length<=0)?'0':limit-length);}"
substringFunction+="}";eval(substringFunction);substring();}});})(jQuery);+function($){'use strict';
var Carousel=function(element,options){this.$element=$(element)
this.$indicators=this.$element.find('.carousel-indicators')
this.options=options
this.paused=this.sliding=this.interval=this.$active=this.$items=null
this.options.pause=='hover'&&this.$element.on('mouseenter',$.proxy(this.pause,this)).on('mouseleave',$.proxy(this.cycle,this))}
Carousel.DEFAULTS={interval:5000,pause:'hover',wrap:true}
Carousel.prototype.cycle=function(e){e||(this.paused=false)
this.interval&&clearInterval(this.interval)
this.options.interval&&!this.paused&&(this.interval=setInterval($.proxy(this.next,this),this.options.interval))
return this}
Carousel.prototype.getActiveIndex=function(){this.$active=this.$element.find('.item.active')
this.$items=this.$active.parent().children('.item')
return this.$items.index(this.$active)}
Carousel.prototype.to=function(pos){var that=this
var activeIndex=this.getActiveIndex()
if(pos>(this.$items.length-1)||pos<0)return
if(this.sliding)return this.$element.one('slid.bs.carousel',function(){that.to(pos)})
if(activeIndex==pos)return this.pause().cycle()
return this.slide(pos>activeIndex?'next':'prev',$(this.$items[pos]))}
Carousel.prototype.pause=function(e){e||(this.paused=true)
if(this.$element.find('.next, .prev').length&&$.support.transition){this.$element.trigger($.support.transition.end)
this.cycle(true)}
this.interval=clearInterval(this.interval)
return this}
Carousel.prototype.next=function(){if(this.sliding)return
return this.slide('next')}
Carousel.prototype.prev=function(){if(this.sliding)return
return this.slide('prev')}
Carousel.prototype.slide=function(type,next){var $active=this.$element.find('.item.active')
var $next=next||$active[type]()
var isCycling=this.interval
var direction=type=='next'?'left':'right'
var fallback=type=='next'?'first':'last'
var that=this
if(!$next.length){if(!this.options.wrap)return
$next=this.$element.find('.item')[fallback]()}
if($next.hasClass('active'))return this.sliding=false
var relatedTarget=$next[0]
var slideEvent=$.Event('slide.bs.carousel',{relatedTarget:relatedTarget,direction:direction})
this.$element.trigger(slideEvent)
if(slideEvent.isDefaultPrevented())return
this.sliding=true
isCycling&&this.pause()
if(this.$indicators.length){this.$indicators.find('.active').removeClass('active')
this.$element.one('slid.bs.carousel',function(){var $nextIndicator=$(that.$indicators.children()[that.getActiveIndex()])
$nextIndicator&&$nextIndicator.addClass('active')})}
var slidEvent=$.Event('slid.bs.carousel',{relatedTarget:relatedTarget,direction:direction})
if($.support.transition&&this.$element.hasClass('slide')){$next.addClass(type)
$next[0].offsetWidth
 $active.addClass(direction)
$next.addClass(direction)
$active.one($.support.transition.end,function(){$next.removeClass([type,direction].join(' ')).addClass('active')
$active.removeClass(['active',direction].join(' '))
that.sliding=false
setTimeout(function(){that.$element.trigger(slidEvent)},0)}).emulateTransitionEnd($active.css('transition-duration').slice(0,-1)*1000)}else{$active.removeClass('active')
$next.addClass('active')
this.sliding=false
this.$element.trigger(slidEvent)}
isCycling&&this.cycle()
return this}

function Plugin(option){return this.each(function(){var $this=$(this)
var data=$this.data('bs.carousel')
var options=$.extend({},Carousel.DEFAULTS,$this.data(),typeof option=='object'&&option)
var action=typeof option=='string'?option:options.slide
if(!data)$this.data('bs.carousel',(data=new Carousel(this,options)))
if(typeof option=='number')data.to(option)
else if(action)data[action]()
else if(options.interval)data.pause().cycle()})}
var old=$.fn.carousel
$.fn.carousel=Plugin
$.fn.carousel.Constructor=Carousel


$.fn.carousel.noConflict=function(){$.fn.carousel=old
return this}

$(document).on('click.bs.carousel.data-api','[data-slide], [data-slide-to]',function(e){var $this=$(this),href
var $target=$($this.attr('data-target')||(href=$this.attr('href'))&&href.replace(/.*(?=#[^\s]+$)/,'')) 
var options=$.extend({},$target.data(),$this.data())
var slideIndex=$this.attr('data-slide-to')
if(slideIndex)options.interval=false
Plugin.call($target,options)
if(slideIndex=$this.attr('data-slide-to')){$target.data('bs.carousel').to(slideIndex)}
e.preventDefault()})
$(window).on('load',function(){$('[data-ride="carousel"]').each(function(){var $carousel=$(this)
Plugin.call($carousel,$carousel.data())})})}(jQuery);+function($){'use strict';
var Collapse=function(element,options){this.$element=$(element)
this.options=$.extend({},Collapse.DEFAULTS,options)
this.transitioning=null
if(this.options.parent)this.$parent=$(this.options.parent)
if(this.options.toggle)this.toggle()}
Collapse.DEFAULTS={toggle:true}
Collapse.prototype.dimension=function(){var hasWidth=this.$element.hasClass('width')
return hasWidth?'width':'height'}
Collapse.prototype.show=function(){if(this.transitioning||this.$element.hasClass('in'))return
var startEvent=$.Event('show.bs.collapse')
this.$element.trigger(startEvent)
if(startEvent.isDefaultPrevented())return
var actives=this.$parent&&this.$parent.find('> .panel > .in')
if(actives&&actives.length){var hasData=actives.data('bs.collapse')
if(hasData&&hasData.transitioning)return
Plugin.call(actives,'hide')
hasData||actives.data('bs.collapse',null)}
var dimension=this.dimension()
this.$element.removeClass('collapse').addClass('collapsing')[dimension](0)
this.transitioning=1
var complete=function(e){if(e&&e.target!=this.$element[0]){this.$element.one($.support.transition.end,$.proxy(complete,this))
return}
this.$element.removeClass('collapsing').addClass('collapse in')[dimension]('')
this.transitioning=0
this.$element.off($.support.transition.end+'.bs.collapse').trigger('shown.bs.collapse')}
if(!$.support.transition)return complete.call(this)
var scrollSize=$.camelCase(['scroll',dimension].join('-'))
this.$element.on($.support.transition.end+'.bs.collapse',$.proxy(complete,this)).emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])}
Collapse.prototype.hide=function(){if(this.transitioning||!this.$element.hasClass('in'))return
var startEvent=$.Event('hide.bs.collapse')
this.$element.trigger(startEvent)
if(startEvent.isDefaultPrevented())return
var dimension=this.dimension()
this.$element[dimension](this.$element[dimension]())[0].offsetHeight
this.$element.addClass('collapsing').removeClass('collapse').removeClass('in')
this.transitioning=1
var complete=function(e){if(e&&e.target!=this.$element[0]){this.$element.one($.support.transition.end,$.proxy(complete,this))
return}
this.transitioning=0
this.$element.trigger('hidden.bs.collapse').removeClass('collapsing').addClass('collapse')}
if(!$.support.transition)return complete.call(this)
this.$element
[dimension](0).one($.support.transition.end,$.proxy(complete,this)).emulateTransitionEnd(350)}
Collapse.prototype.toggle=function(){this[this.$element.hasClass('in')?'hide':'show']()}

function Plugin(option){return this.each(function(){var $this=$(this)
var data=$this.data('bs.collapse')
var options=$.extend({},Collapse.DEFAULTS,$this.data(),typeof option=='object'&&option)
if(!data&&options.toggle&&option=='show')option=!option
if(!data)$this.data('bs.collapse',(data=new Collapse(this,options)))
if(typeof option=='string')data[option]()})}
var old=$.fn.collapse
$.fn.collapse=Plugin
$.fn.collapse.Constructor=Collapse


$.fn.collapse.noConflict=function(){$.fn.collapse=old
return this}

$(document).on('click.bs.collapse.data-api','[data-toggle="collapse"]',function(e){var $this=$(this),href
var target=$this.attr('data-target')||e.preventDefault()||(href=$this.attr('href'))&&href.replace(/.*(?=#[^\s]+$)/,'') 
var $target=$(target)
var data=$target.data('bs.collapse')
var option=data?'toggle':$this.data()
var parent=$this.attr('data-parent')
var $parent=parent&&$(parent)
if(!data||!data.transitioning){if($parent)$parent.find('[data-toggle="collapse"][data-parent="'+parent+'"]').not($this).addClass('collapsed')
$this[$target.hasClass('in')?'addClass':'removeClass']('collapsed')}
Plugin.call($target,option)})}(jQuery);+function($){'use strict';
var dismiss='[data-dismiss="alert"]'
var Alert=function(el){$(el).on('click',dismiss,this.close)}
Alert.prototype.close=function(e){var $this=$(this)
var selector=$this.attr('data-target')
if(!selector){selector=$this.attr('href')
selector=selector&&selector.replace(/.*(?=#[^\s]*$)/,'')
}
var $parent=$(selector)
if(e)e.preventDefault()
if(!$parent.length){$parent=$this.hasClass('alert')?$this:$this.parent()}
$parent.trigger(e=$.Event('close.bs.alert'))
if(e.isDefaultPrevented())return
$parent.removeClass('in')
function removeElement(){$parent.trigger('closed.bs.alert').remove()}
$.support.transition&&$parent.hasClass('fade')?$parent.one($.support.transition.end,removeElement).emulateTransitionEnd(150):removeElement()}

function Plugin(option){return this.each(function(){var $this=$(this)
var data=$this.data('bs.alert')
if(!data)$this.data('bs.alert',(data=new Alert(this)))
if(typeof option=='string')data[option].call($this)})}
var old=$.fn.alert
$.fn.alert=Plugin
$.fn.alert.Constructor=Alert


$.fn.alert.noConflict=function(){$.fn.alert=old
return this}

$(document).on('click.bs.alert.data-api',dismiss,Alert.prototype.close)}(jQuery);+function($){'use strict';
var Button=function(element,options){this.$element=$(element)
this.options=$.extend({},Button.DEFAULTS,options)
this.isLoading=false}
Button.DEFAULTS={loadingText:'loading...'}
Button.prototype.setState=function(state){var d='disabled'
var $el=this.$element
var val=$el.is('input')?'val':'html'
var data=$el.data()
state=state+'Text'
if(!data.resetText)$el.data('resetText',$el[val]())
$el[val](data[state]||this.options[state]) 
setTimeout($.proxy(function(){if(state=='loadingText'){this.isLoading=true
$el.addClass(d).attr(d,d)}else if(this.isLoading){this.isLoading=false
$el.removeClass(d).removeAttr(d)}},this),0)}
Button.prototype.toggle=function(){var changed=true
var $parent=this.$element.closest('[data-toggle="buttons"]')
if($parent.length){var $input=this.$element.find('input')
if($input.prop('type')=='radio'){if($input.prop('checked')&&this.$element.hasClass('active'))changed=false
else $parent.find('.active').removeClass('active')}
if(changed)$input.prop('checked',!this.$element.hasClass('active')).trigger('change')}
if(changed)this.$element.toggleClass('active')}

function Plugin(option){return this.each(function(){var $this=$(this)
var data=$this.data('bs.button')
var options=typeof option=='object'&&option
if(!data)$this.data('bs.button',(data=new Button(this,options)))
if(option=='toggle')data.toggle()
else if(option)data.setState(option)})}
var old=$.fn.button
$.fn.button=Plugin
$.fn.button.Constructor=Button


$.fn.button.noConflict=function(){$.fn.button=old
return this}

$(document).on('click.bs.button.data-api','[data-toggle^="button"]',function(e){var $btn=$(e.target)
if(!$btn.hasClass('btn'))$btn=$btn.closest('.btn')
Plugin.call($btn,'toggle')
e.preventDefault()})}(jQuery);+function($){'use strict';
function transitionEnd(){var el=document.createElement('bootstrap')
var transEndEventNames={WebkitTransition:'webkitTransitionEnd',MozTransition:'transitionend',OTransition:'oTransitionEnd otransitionend',transition:'transitionend'}
for(var name in transEndEventNames){if(el.style[name]!==undefined){return{end:transEndEventNames[name]}}}
return false
} 
$.fn.emulateTransitionEnd=function(duration){var called=false,$el=this
$(this).one($.support.transition.end,function(){called=true})
var callback=function(){if(!called)$($el).trigger($.support.transition.end)}
setTimeout(callback,duration)
return this}
$(function(){$.support.transition=transitionEnd()})}(jQuery);