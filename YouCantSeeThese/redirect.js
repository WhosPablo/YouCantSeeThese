$(document).ready(function() {
        setTimeout(fadeMyDiv, 1000)
        $('#unblockButton').click(function(){
            window.location.href='index.html';
        })
    }
);

function fadeMyDiv() {
    $("#vid")[0].src += "&autoplay=1";
    $("#vidDiv").fadeOut(2000);
}