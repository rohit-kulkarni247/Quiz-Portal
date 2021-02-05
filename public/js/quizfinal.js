function countDown(sec, elem){
    var element = document.getElementById(elem);
    element.innerHTML=sec;
    if(sec<1){
        clearTimeout(timer);
        document.getElementById('countdown').innerHTML="0"
        // element.innerHTML='<h1 style="padding:0px;font-size:59px">Time Up!</h1>';
    }
    sec--;
    var timer =setTimeout('countDown('+sec+',"'+elem+'")', 1000 );
}

$(document).ready(function() {
    $('#question').bind('copy paste cut',function(e) { 
        e.preventDefault(); //disable cut,copy,paste
        
    });
});

$(document).ready(function() {
    $('#field').bind('copy paste cut',function(e) { 
        e.preventDefault(); //disable cut,copy,paste
        
    });
});

// function submitPoll(){
//     document.getElementById("btn").disabled = true;
//     // var butimer=<%% butimer %>;
//     setTimeout(function(){document.getElementById("btn").disabled = false;},5000);
// }
// submitPoll();

$(window).blur(function() {
    window.location="/logout";
});