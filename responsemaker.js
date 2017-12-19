window.onload = function(){
    
        generate();
        
    
    }
    
    
    function generate(){
    
    
    jsons = document.getElementById("inputText").value;
    
    className = document.getElementById("className").value;
    
    document.getElementById("outputText").value = "";
    try {
        var parsedJ = JSON.parse(jsons);
       document.getElementById("error").innerHTML = "";
       document.getElementById("download").style.display = "inline";
       
        
        
    } catch (error) {
        document.getElementById("error").innerHTML = error;
        document.getElementById("download").style.display = "none";
        
        
    }
    
    var test = new responseMaker(parsedJ,className);
    
   
    test.getFields();
    test.writeFields();
    test.writeSetterAndGetters();
    test.closeClass();
    test.writeObjects();
    
    
    }
    
      function responseMaker(jsonString,className){
    
    this.className= className;
    this.jsonObject = jsonString;
    this.properties = [];
    this.dependencies = [];
    }
    
    
    responseMaker.prototype.toString= function(){
    
    console.log(this.jsonObject);
    }
    
    responseMaker.prototype.writeclassDeclaration= function(){
    
    this.appendLine("public class "+this.className+"{\n");
    }
    
    responseMaker.prototype.closeClass= function(){
    
    this.appendLine("}");
    }
    
    responseMaker.prototype.getFields = function(){
    
    
    for (var property in this.jsonObject) {
        if (this.jsonObject.hasOwnProperty(property)) {
          
           var isArray = false;
           
           
           
          if(JSON.stringify(eval('this.jsonObject.'+property)).charAt(0) == '[' ){
          isArray= true;
          }
           var propertyObject = [property, isArray];
        
           this.properties.push(propertyObject);
        }
    }
    
    
    
    }
    
    responseMaker.prototype.writeFields= function(){
    var imports = "";
    var linestoAppend ="";
    var constructorArgs = [];
    var size = this.properties.length;
    
    for(var p = 0; p < size; p++){
    
    var type = eval( 'typeof this.jsonObject.'+ this.properties[p][0]);
    
    if(type == "object" ){
    
    var depend = JSON.stringify(eval('this.jsonObject.'+this.properties[p][0]));
    
    if(depend.charAt(0) == '['){
    depend = depend.substring(1,depend.length-1);
    if(depend.charAt(0) !="{"){
        
       depend = depend.split(',')[0];
    }
    var strings= [];
 

    for(var i = 0; i < depend.length-1; i++){

        if(depend.charAt(i) == "\""){

            if(strings.length > 0){

                strings.pop();
            }else{
                strings.push("\"");
                continue;
            }
        }
       
        
        if(strings.length <= 0 && depend.charAt(i) == ',' && depend.charAt(i+1) == "{"){
        
            depend = depend.substring(0,i);
            
            break;
            
        } 
        
    }
    
    var dependJson = JSON.parse(depend);
    var type = typeof dependJson;
    if( type != "object" ){
    
    switch(type){
    case 'number': type = 'Integer'; break;
    case 'string': type = 'String'; break;
    
    }
    var field = ["List<"+ type+"> "+this.properties[p][0],this.properties[p][0] ];
    constructorArgs.push(field);

    linestoAppend= linestoAppend+ field[0]+";\n";
    
    }else{
    
    var objectName = this.properties[p][0];
    var firstChar = objectName.charAt(0).toUpperCase();
    objectName = firstChar +objectName.substring(1,objectName.length);

    var field = ["List<"+objectName+"> "+this.properties[p][0],this.properties[p][0] ];
    constructorArgs.push(field);
    
    linestoAppend= linestoAppend+ field[0]+";\n";
    
    dependObject = [depend, this.properties[p][0]]
    this.dependencies.push(dependObject);
    
    }
    }else{
        var objectName = this.properties[p][0];
        var firstChar = objectName.charAt(0).toUpperCase();
        objectName = firstChar +objectName.substring(1,objectName.length);

        var field = [objectName+ " "+this.properties[p][0],this.properties[p][0] ];
        constructorArgs.push(field);
        

    linestoAppend= linestoAppend+ field[0]+";\n";
    
    dependObject = [depend, this.properties[p][0]]
    this.dependencies.push(dependObject);
    }
    
    
    
    
    
    }else{
    switch(type){
    case 'number': type = 'int'; break;
    case 'string': type = 'String'; break;
    
    }

    var field = [type+ " "+this.properties[p][0],this.properties[p][0] ];
    constructorArgs.push(field);
    
    linestoAppend= linestoAppend+ field[0]+";\n";
    
    }
    
    
    }

if(linestoAppend.indexOf("List<") !== -1 ){

    
    this.appendLine('import java.util.List;\n')
    this.writeclassDeclaration();
    
}else{
    this.writeclassDeclaration();
    
}
this.appendLine(linestoAppend);

    constructor = "public "+this.className+ "(";
    var noArgcons = constructor + "){}";
    for(var i = 0; i < constructorArgs.length; i=i+1){

        constructor = constructor + constructorArgs[i][0];
        if(i < constructorArgs.length -1){
        constructor = constructor + ", ";
        }
    }
    constructor = constructor +"){\n\n";

    for(var i = 0; i < constructorArgs.length; i=i+1){
     
        constructor = constructor + "this."+constructorArgs[i][1]+ " = "+ constructorArgs[i][1]+";\n\n";

    }

    constructor = constructor + "}";
    this.appendLine("\n"+ noArgcons);
    this.appendLine("\n"+constructor);
    
    }
    
    
    responseMaker.prototype.writeSetterAndGetters= function(){
        this.appendLine("");
        
    var size = this.properties.length;
    
    for(var p = 0; p < size; p++){
        var objectName = this.properties[p][0];
        var firstChar = objectName.charAt(0).toUpperCase();
        objectName = firstChar +objectName.substring(1,objectName.length);
    
    var type = eval( 'typeof this.jsonObject.'+ this.properties[p][0]);
        
    var objectType = eval('this.jsonObject.'+ this.properties[p][0]);
    
    if(type != 'object'){
    
    if(eval('this.jsonObject.'+ this.properties[p]) == true){
    switch(type){
    case 'number': type = 'Integer'; break;
    case 'string': type = 'String'; break;
    
    }
    
    this.appendLine("public void set"+objectName+"(List<"+type+">" + this.properties[p][0]+"){\n 	this."+this.properties[p][0]+ " = " + this.properties[p][0]+";\n}\n");
    this.appendLine("public List<"+type+"> get"+objectName+"(){\n\n 	return this." + this.properties[p][0]+";\n\n}\n");
    
    }else{
    switch(type){
    case 'number': type = 'int'; break;
    case 'string': type = 'String'; break;
    
    }
    this.appendLine("public void set"+objectName+"("+type+" " + this.properties[p][0]+"){\n\n 	this."+this.properties[p][0]+ " = " + this.properties[p][0]+";\n\n}\n");
    this.appendLine("public "+type+" get"+objectName+"(){\n\n 	return this." + this.properties[p][0]+";\n\n}\n");
    
    }
    }
    
    else{
    
    
    if(eval('this.jsonObject.'+ this.properties[p]) == true){
    var arrayType = typeof eval('this.jsonObject.'+ this.properties[p][0])[0];
    if(arrayType != 'object'){
    
    switch(arrayType){
    case 'number': arrayType = 'Integer'; break;
    case 'string': arrayType = 'String'; break;
    
    }
    
    this.appendLine("public void set"+objectName+"(List<"+arrayType+">" + this.properties[p][0]+"){\n\n 	this."+this.properties[p][0]+ " = " + this.properties[p][0]+";\n\n}");
    this.appendLine("public List<"+arrayType+"> get"+objectName+"(){\n\n 	return this." + this.properties[p][0]+";\n\n}\n");
    
    }else{
    
    
    this.appendLine("public void set"+objectName+"(List<"+objectName+"> " + this.properties[p][0]+"){\n\n 	this."+this.properties[p][0]+ " = " + this.properties[p][0]+";\n\n}");
    this.appendLine("public List<"+objectName+"> get"+objectName+"(){\n\n 	return this."+this.properties[p][0]+";\n\n}\n");
    
    }
    
    
    
    
    }else{
    var objectName = this.properties[p][0];
    var firstChar = objectName.charAt(0).toUpperCase();
    objectName = firstChar +objectName.substring(1,objectName.length);
    this.appendLine("public void set"+objectName+"("+objectName+" " + this.properties[p][0]+"){\n\n 	this."+this.properties[p][0]+ " = " + this.properties[p][0]+";\n\n}\n");
    this.appendLine("public "+objectName+" get"+objectName+"(){\n\n\n 	return this."+this.properties[p][0]+";\n\n}\n");
    
    }
    }
    }
    
    }
    
    
    responseMaker.prototype.writeObjects= function(){
    if(this.dependencies.length <= 0){
    return;
    }
    this.appendLine("\n//end of class\n");
    var popped= this.dependencies.pop();
    var objectName = popped[1];
    var firstChar = objectName.charAt(0).toUpperCase();
    objectName = firstChar +objectName.substring(1,objectName.length);
    var dep = new responseMaker(JSON.parse(popped[0]),objectName);
    
    dep.getFields();
    dep.writeFields();
    dep.writeSetterAndGetters();
    dep.closeClass();
    dep.writeObjects();
    this.writeObjects();
    
    }
    
    
    
    
    responseMaker.prototype.appendLine= function(lineOfCode){
    
    existingCode = document.getElementById("outputText").value;
    document.getElementById("outputText").value = existingCode + "\n"+  lineOfCode
    
    }
    
     
    function destroyClickedElement(event)
    {
        document.body.removeChild(event.target);
    }
    
    function saveFiles(){
        var textToSave = document.getElementById("outputText").value;
        var files = textToSave.split("//end of class");
        var zip = new JSZip();
        
        for(var i = 0; i < files.length; i=i+1){
            var filename = files[i].match(/public class .*(?={)/i);
        
            filename = filename[0].substring(12,filename[0].length);
            filename = filename.trim();
            zip.file(filename+".java",files[i].trim());
        }
    
        
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            saveAs(content, "Classes.zip");
        });
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        
           var button = document.getElementById('generate');
       
           var downloadButton = document.getElementById('download');
    
       
           downloadButton.addEventListener('click', () => {
            saveFiles();
             });
             button.addEventListener('click', () => {
          generate();
           });
       
       
       
         });
       