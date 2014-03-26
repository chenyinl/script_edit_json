$(document).ready(function(){
    // initial text JSON from Texts.js
    scriptBuilder.initial();

    // set the form to the left up corner
    $(window).scroll( function() {
        var t = $(window).scrollTop()+20;
        $('#table_div').offset({top: t});
    });
});

/* the main class */
var scriptBuilder = new function(){
    
    // holds the data array
    this.textList = new Object();

    // max lenght for the text, not enforce, just warning
    this.textMaxLength = 20;

    // after the base length, delay will increase by 0.5 
    // every this.textIncrease
    this.textBaseLength = 12;

    // increase delay time by this many chars
    this.textIncrease = 5;

    // max delay time
    this.delayTimeMax = 3;

    // min and default delay time
    this.delayTimeMin = 1.5;

    // keep info of which node was highlighted
    this.highlightedNode=new Object();

    // message time handler
    this.timeOutHandle = 0;

    // formatted JSON content
    this.JSONContent = "";

    // ****** values ******
    // category value
    this.categoryValue = "";

    // name value
    this.nameValue = "";

    // text (script)
    this.textValue = "";

    // delay time
    this.delayTime = 1.5;

    // the actually base lenght, for example
    // 12-5 = 7, after 8 chars it will increase time by 7+5.
    this.textBaseNum=this.textBaseLength - this.textIncrease;

    // a function call when jQuery ready
    this.initial = function(){
        // get data and save to the array
        this.setTextList();

        // display on the left table for edit
        this.showTable();

        // display on the JSON table as output
        this.showJSON();
        
        // show the remain text lenght
        this.showRemainTextLength();

        // hide the button that not in use when loaded.
        this.reset();

        // set top position of the form
        $('#table_div').offset({top: 20});
    }
    
    // load the existing JSON from file
    this.setTextList = function(){
        // Texts.prototype is passed from Texts.js
        this.textList = Texts.prototype;
    }

    // show on the left table with delete function
    // id for each node is "category" + "name"+ "text order"
    this.showTable = function(){
        var htmlStr = "<ul>";
        for( var cat in this.textList ){
            // set up category
            htmlStr += "<li class=\'categoryNode\'>"+
                "<span class = 'category_text' >" + cat + 
                "</span>&nbsp;&nbsp;"+
                // set up the add function [+]
                "<span class='selectable add'"+
                    "title='Add new text.' "+
                    "id='"+cat+"'"+
                    "onclick=\"scriptBuilder.highlightCategory" +
                    "(\'"+cat+"\', \'"+cat+"\')\""+">[+]</span><ul>";

            for( var name in this.textList[cat] ){
                // set up name
                htmlStr += "<li class=\'nameNode\'>" +
                    "<span id=\'" + cat + name + "Edit\' " +
                        "title = 'Edit this name' " +
                        "class = \'selectable\'" +
                        "onclick = \"scriptBuilder.highlightName( " +
                            // id for the name is "category" + "name" + "Edit"
                            "\'" + cat + name + "Edit\',"+
                            "\'" + cat + "\', \'"+ name +"\')\"" +
                        ">" + name + 
                    "</span>&nbsp;&nbsp;" +

                    // set up the add function [+]
                    "<span id=\'"+cat+name+"\' "+
                        "title = 'Add new text under this name.' " +
                        "class = \'selectable add\'"+
                        "onclick = \"scriptBuilder.highlightNamePlus( " +
                            "\'"+cat+name+"\', \'"+ cat +"\', \'"+ name +"\'"+
                        " )\">[+]" +
                    "</span><ul>";

                for( var i = 0; i < this.textList[cat][name].length; i++){
                    // set up each text
                    htmlStr += "<li class = \'textNode selectable\' "+
                        "id = \'"+cat+name+i+"\' "+
                        "title='Edit this text.' "+
                        "onclick=\"scriptBuilder.highlightNode(\'"+
                            cat+name+i+"\'," + // id
                            " \'"+cat+"\'," +  // category
                            " \'"+name+"\'," + // name
                            "\'"+i+"\'"+       // order number
                        " )\">" +
                    // format: text (delay time)
                    this.textList[cat][name][i].text + "&nbsp;&nbsp; ( "+
                    this.textList[cat][name][i].delay + " )&nbsp;" +
                    "</li>";
                }
                htmlStr += "</ul></li><br/>";
            }
            htmlStr += "</ul></li>";
        }
        htmlStr += "</ul>";
        $( "#show_div" ).html( htmlStr );
    }
    
    // show JSON on the JSON div
    this.showJSON = function(){
        // add 4 space for indent
        var htmlStr = "(function() {\nTexts = function() {}\n";
        htmlStr += "var p = Texts.prototype;\n";
        for( var cat in this.textList ){
            htmlStr += "p." + cat + "=";
            htmlStr += JSON.stringify( this.textList[cat], null, 4 );
            htmlStr += ";\n\n";
        }        
        // add <pre> tag for indent to show
        htmlStr += "}());";
        this.JSONContent = htmlStr;
        $( "#json_div" ).html( "<pre>" + htmlStr + "</pre>" );
    }
    
    // when a text node is highlighted
    this.highlightNode = function( id, cat, name, i ){
        this.setHighlightedNode( id, cat, name, i );
        $( "#update_name_button" ).hide();
        // select the category
        $( "#category option[value="+cat+"]" ).attr( "selected", "selected" );
        // hide not in use button and pre-fill the value
        $( "#category_text" ).html(cat).show();
        $( "#new_button" ).hide();
        $( "#edit_button" ).show();
        $( "#delete_button" ).show();
        $( "#category" ).hide();
        $( "#newName" ).hide();
        $( "#name" ).html(name).show();
        $( "#script" ).val(this.textList[cat][name][i].text).prop( "disabled", false);
        $( "#delay" ).val(this.textList[cat][name][i].delay).prop( "disabled",false);
        this.showRemainTextLength();
        
        // not using message, use mouse over 
        // this.showMessage( "Edit selected text.", "safe" );

    }
    // highlight name to edit name
    this.highlightName = function( id, cat, name){
        this.setHighlightedNode( id, cat, name, "" );
        $( "#category option[value=" + cat + "]" ).attr( "selected", "selected" ); 
        $( "#category" ).hide();
        $( "#delete_button" ).hide();
        $( "#edit_button" ).hide();
        $( "#newName" ).val(name).show();
        $( "#category_text" ).html(cat).show();
        $( "#name" ).html(name).hide();
        $( "#script" ).val( "" ).prop( "disabled", true);
        this.showRemainTextLength();
        $( "#delay" ).val( "" ).prop( "disabled",true);
        $( "#new_button" ).hide();
        $( "#update_name_button" ).show();
        //this.showMessage( "Edit selected name.", "safe" );

    }

    // highlight the plus sign next to a name
    // show the button to edit the name only
    this.highlightNamePlus = function( id, cat, name){
        this.setHighlightedNode( id, cat, name, "" );
        $( "#category option[value=" + cat + "]" ).attr( "selected", "selected" ); 
        $( "#category" ).hide();
        $( "#delete_button" ).hide();
        $( "#edit_button" ).hide();
        $( "#newName" ).hide();
        $( "#update_name_button" ).hide();
        $( "#category_text" ).html(cat).show();
        $( "#name" ).html(name).show();
        $( "#script" ).val( "" ).prop( "disabled", false );
        this.showRemainTextLength();
        $( "#delay" ).val( "1.5" ).prop( "disabled",false );
        $( "#new_button" ).show();
        //this.showMessage( "Add new text with name '"+name+"'.", "safe" );
    }
    
    // highlight the category, show add new button
    this.highlightCategory = function( id, cat){
        this.setHighlightedNode( id, cat,"","");
        $( "#category_text" ).hide();
        $( "#update_name_button" ).hide();
        $( "#category option[value=" + cat + "]" ).attr( "selected", "selected" ); 
        $( "#category" ).show();
        $( "#newName" ).val( "" ).show();
        $( "#script" ).val( "" ).prop( "disabled", false);
        this.showRemainTextLength();
        $( "#delay" ).val( "1.5" ).prop( "disabled",false);
        $( "#name" ).hide();
        $( "#delete_button" ).hide();
        $( "#edit_button" ).hide();
        $( "#new_button" ).show();
        //this.showMessage( "Add new text with category '"+cat+"'.", "safe" );
    }

    // reset the button after an add, edit, or delete
    this.reset = function(){
        this.setHighlightedNode("","","","");
        $( "#category_text" ).hide();      
        $( "#category" ).show();
        $( "#script" ).val( "" ).prop( "disabled", false);
        $( "#delay" ).val( "1.5" ).prop( "disabled",false);
        $( "#name" ).hide();
        $( "#newName" ).val("").show();
        $( "#update_name_button" ).hide();
        $( "#delete_button" ).hide();
        $( "#edit_button" ).hide();
        $( "#new_button" ).show();
        this.showTable();
        this.showJSON();     
    }

    // save what is hightlighted for future use
    this.setHighlightedNode = function( id, category, name, i){
        // remove highlight css from previous node and add to current
        $( "#"+this.highlightedNode.id).removeClass( "highlighted" );
        $( "#"+id).addClass( "highlighted" );
        this.highlightedNode.id = id;
        this.highlightedNode.category = category;
        this.highlightedNode.name = name;
        this.highlightedNode.number = i;
    }

    // add new text node with delay time
    this.addNode = function(){
        try{
            this.setCategoryValue();
            this.setNameValue();
            this.setTextValue();
            this.setDelayTime();
        } catch (err) {
            this.showMessage(err, "warning");
            return;
        }

        // create new category if not exists
        if( this.textList[this.categoryValue] === undefined ){
            this.textList[this.categoryValue] = new Object();
        }
        
        // create new name if not exists
        if( this.textList[this.categoryValue][this.nameValue] === undefined ){
            this.textList[this.categoryValue][this.nameValue] = new Array();
        }
        
        // new node object
        var node = new Object();
        node.text = this.textValue;
        node.delay = this.delayTime;
    
        // attach to the data list
        this.textList[this.categoryValue][this.nameValue].push( node );

        // reflesh the page
        this.reset();
        this.showMessage( "Text added.", "safe" );
    }

    // update the name
    this.updateName = function(){
        
        try{
            this.setNameValue();
            this.checkIfNameUpdated();
        }catch(err) {
            this.showMessage(err, "warning");
            this.compareNames();
            return;
        }
        var oldName = this.highlightedNode.name;
        var newName = this.nameValue;
        var cat = this.highlightedNode.category;
        this.textList[cat][newName] = this.textList[cat][oldName];
        delete this.textList[cat][oldName];
        this.reset();
        this.showMessage( 
            "Name updated. <br/>The edited name might be placed at the end.",
            "safe"
        );
    }
    
    // check if the user actually update the name
    // since update name involves JSON copy and delete
    // return if no update needed.
    this.checkIfNameUpdated = function(){
        if(this.highlightedNode.name == this.nameValue){
            throw "Same Name was entered.";
        }
    }

    // delete a line of text (node)
    this.deleteNode = function(){
        var cat = this.highlightedNode.category;
        var name = this.highlightedNode.name;
        var i=this.highlightedNode.number;

        this.textList[cat][name].splice( i,1 );

        // if no node under the name, delete the name
        if(this.textList[cat][name].length==0){
            delete this.textList[cat][name];

            // if no name under the category, 
            // delete this category
            //if(this.categoryIsEmpty(this.textList[cat])){
                //delete this.textList[cat];
            //} 
            // not delete category at this time
        }
        // reflesh the page
        this.reset();
        this.showMessage( "Text deleted.", "safe" );
    }

    // edit a text script node
    this.editNode = function(){
        var cat = this.highlightedNode.category;
        var name = this.highlightedNode.name;
        var i = this.highlightedNode.number;
        try{
            this.setTextValue();
            this.setDelayTime();
        }catch( err ) {
            this.showMessage( err, "warning");
            return;
        }
        this.textList[cat][name][i].text=this.textValue;
        this.textList[cat][name][i].delay=this.delayTime;
        this.reset();
        this.showMessage( "Text saved.", "safe" );
    }   
    
    // get tand check the category
    this.setCategoryValue = function(){
        if(
            $( "#category" ).css( "display" )!=='none' && 
            $( "#category" ).is( ":visible" )
        ){
            // use input
            this.categoryValue = $( "#category" ).val();
        }else{
            // use preset
            this.categoryValue =$( "#category_text" ).html();
        }
        // category cannot be wrong because it is either
        // selected copied from text
    }

    // set the name
    this.setNameValue = function(){
        if(
            // double check visibility
            $( "#name" ).css( "display" ) !== 'none' &&
            $( "#name" ).is( ":visible" )
        ){
            // use preset
            var name = $( "#name" ).html();
        }else{
            // use input
            var name =$( "#newName" ).val();
        }

        // if no name, error message
        if(name == "" ){
            throw "Name field is empty.";
        }
        this.nameValue = name;
    }

    // get and check the text (script) value
    this.setTextValue = function(){
        var textValue = $( "#script" ).val();
        if (textValue == "" ){
            throw "Text field is empty";        
        }
        this.textValue = textValue;
    }

    // get delay time and check the value
    // it sould be between 1.5 to 3
    this.setDelayTime = function(){
        var delayValue = $( "#delay" ).val();
        if ( delayValue == "" ){
            var mesg = "Delay field is empty.";
            throw mesg;            
        }

        if ( 
            isNaN( delayValue ) || 
            delayValue < this.delayTimeMin || 
            delayValue > this.delayTimeMax
        ){
            throw "Delay time should be between 1.5 to 3.";        
        }
        this.delayTime = delayValue;
    }
   
    // check if category is empty
    // Not in use. Not allow delete category
    this.categoryIsEmpty = function(obj){
        for(var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    // show how many character available for user input
    this.showRemainTextLength = function(){
        var str = $( "#script" ).val();
        var len = str.length;
        var remain = this.textMaxLength - len;
        var className = "save";
        if(remain < 0){
            $( "#remainCount" ).removeClass( "safe" );
            $( "#remainCount" ).addClass( "warning" );
        }else{
            $( "#remainCount" ).removeClass( "warning" );
            $( "#remainCount" ).addClass( "safe" );
        }
        $( "#remainCount" ).html(remain);
    }
    
    // automatically suggest delay time, can be overwrite by user
    this.showDelay = function(){
        var str=$( "#script" ).val();
        var len = str.length;
        var addition = parseInt((len -this.textBaseNum)/this.textIncrease);
        if(addition<0){
            addition=0;
        }
        addition *=0.5;
        var t=1.5 + addition;

        // if there is an period or question mark, add one second
        if( 
            str.indexOf( "." ) != -1 || 
            str.indexOf( "?" ) != -1 ||
            str.indexOf( "!" ) != -1 
        ){
            t += 1;
        }

        // max is 3 second
        if(t>this.delayTimeMax){
            t=this.delayTimeMax;
        }
        $( "#delay" ).val(t);
    }

    // display a list of text
    this.showListView = function(){
        $( "#list_button" ).removeClass( "inactive" );
        $( "#JSON_button" ).addClass( "inactive" );
        $( "#show_div" ).show();
        $( "#json_div" ).hide();
    }

    // display JSON view
    this.showJSONView = function(){
        $( "#list_button" ).addClass( "inactive" );
        $( "#JSON_button" ).removeClass( "inactive" );
        $( "#show_div" ).hide();
        $( "#json_div" ).show();
    }

    // shows message with given class name and fade out to class
    // "oldMessage in 2 second
    this.showMessage = function(  message, mesgClass ){
        if( this.timeOutHandle !=0 ){
            clearTimeout( this.timeOutHandle );
        }
        var messageBoxId = "messageBox"; // id for this message box
        $( "#" + messageBoxId).html( message );
        $( "#" + messageBoxId).removeClass( "oldMessage" );
        $( "#" + messageBoxId).addClass(mesgClass);
        this.timeOutHandle = setTimeout( 
            function(){
                $( "#" + messageBoxId).removeClass( "warning" );
                $( "#" + messageBoxId).removeClass( "safe" );
                $( "#" + messageBoxId).addClass( "oldMessage" );
            },
            2000 // 2 second
        );
    }
    
    // Download JSON in a file, require HTML 5
    // from http://stackoverflow.com/questions/2897619/
    // using-html5-javascript-to-generate-and-save-a-file/18197511#18197511
    this.download = function(){
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + 
            encodeURIComponent(this.JSONContent));
        pom.setAttribute('download', "Texts.js" );
        pom.click();
    }
} //end of class
