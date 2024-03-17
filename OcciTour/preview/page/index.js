

$(".player.small_row").on("click", function() {
    console.log("Click", this);
    console.log($(this).toggleClass("open").next(".player.view_row").toggleClass("open"));
})