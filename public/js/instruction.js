$(document).ready(function() {
    $('input[type="checkbox"]').click(function(){
        if($(this).prop("checked") == true){
            document.getElementById("proceed").disabled = false;
        }
        else{
            document.getElementById("proceed").disabled=true;
        }
    });
});