var url = "mock/mock.json";

var $accounts_table = $('#user-accounts');
var $right_panel = $('#right-panel')

var make_active_user = function() {
    // remove active class from all the rows
    $.each($accounts_table.children(), function(index, value) {
        $(value).removeClass('active');
    });
    $(this).addClass('active');
    $(this).attr('data-id');
    $right_panel.addClass('showing');
}

$.getJSON(url, function(response) {
    var users = response.users;
    var transactions = response.transactions;
    console.log(users, transactions);

    $.each(users, function(index, value) {
        var user_div = $('<div></div>')
            .addClass('user-row')
            .attr("data-id", value.id)
            .click(make_active_user);
        var phone = $('<div></div>')
            .addClass('col-phone')
            .text(value.phone);
        var regis_date = $('<div></div>')
            .addClass('col-regis-date')
            .text(value["regis-date"]);
        var balance = $('<div></div>')
            .addClass('col-balance')
            .text(value.balance);

        user_div.append(phone).append(regis_date).append(balance);
        $accounts_table.append(user_div);
    })


});