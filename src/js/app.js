var url = "mock/mock.json";

var users = [];
var transactions = [];

var $user_list = $('#user-list');
var $right_panel = $('#right-panel');
var $transaction_list = $('#transaction-list');
var $account_details_phone = $right_panel.find('.col-phone');
var $account_details_date = $right_panel.find('.col-regis-date');
var $account_details_balance = $right_panel.find('.col-balance');
var $chart_container = $('#chart-container');

// chart configurations

var chart_options = {
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero:true
            }
        }]
    },
    legend: {
        display: false
    }
};

var chart_labels = ["Jan", "Feb", "March", "April", "May", "June"];
var chart_background_color =  'rgba(109,176,45,0.2)';
var chart_border_color = '#6DB02D';

function make_chart_data(transactions) {
    // this doesn't actually work yet, here is some fake data
    return [0, 11, 8, 5, -3, 13];
}
    

// fetch mock data

$.getJSON(url, function(response) {
    users = response.users;
    transactions = response.transactions;
    console.log(users, transactions);

    $.each(users, function(index, value) {
        var user_div = $('<div></div>')
            .addClass('user-row')
            .attr("data-id", value.id)
            .click(make_current_user);
        var phone = $('<div></div>')
            .addClass('col-phone')
            .text(value.phone);
        var regis_date = $('<div></div>')
            .addClass('col-regis-date')
            .text(value["regis-date"]);
        var balance = $('<div></div>')
            .addClass('col-balance')
            .text(value.balance);

        user_div.append(phone)
                .append(regis_date)
                .append(balance);
        $user_list.append(user_div);
    });
});

// find the user object from the array from its id

function find_user(users, id) {
    for (var i = 0; i < users.length; i++) {
        if (parseInt(users[i].id) == id) {
            return users[i];
        }
    }
}

// find all the transactions where the user is sender or recipient

function find_transactions(transactions, id) {
    var user_transactions = [];
    for (var i = 0; i < transactions.length; i++) {
        var sender_id = transactions[i].sender;
        var recipient_id = transactions[i].recipient;
        if ((sender_id === parseInt(id)) || (recipient_id === parseInt(id))) {
            user_transactions.push(transactions[i]);
           }
    }
    return user_transactions;
}

/* when someone clicks on a user in the left panel, 
 it will fill out the right panel with their transactions */

var make_current_user = function() {
    $right_panel.show();   // need to set to show here to avoid chart bug on the first click

    // remove active class from all the rows
    $.each($user_list.children(), function(index, value) {
        $(value).removeClass('active');
    });

    // make this row the active row
    $(this).addClass('active');

    // show that user's account details in the right panel
    var id = $(this).attr('data-id');
    var current_user = find_user(users, id);
    $account_details_phone.text(current_user.phone);
    $account_details_date.text(current_user['regis-date']);
    $account_details_balance.text(current_user.balance); 

    $transaction_list.empty();
    var user_transactions = find_transactions(transactions, id);

    // fill out transaction list

    $.each(user_transactions , function(index, value) {
        var transaction_div = $('<div></div>')
            .addClass('transaction-row')
            .attr("data-id", value.id);
        var sender = $('<div></div>')
            .addClass('col-sender')
            .text(find_user(users, value.sender).phone);  // this is probably REALLY inefficient, sorry.......
        var recipient = $('<div></div>')
            .addClass('col-recipient')
            .text(find_user(users, value.recipient).phone);  // this is probably REALLY inefficient, sorry.......
        var datetime = $('<div></div>')
            .addClass('col-datetime')
            .text(value.datetime);
        var amount = $('<div></div>')
            .addClass('col-amount')
            .text(value.amount);
        transaction_div.append(sender)
                       .append(recipient)
                       .append(datetime)
                       .append(amount);
        $transaction_list.append(transaction_div);
    });

    // reset and make chart
    
    $chart_container.empty();
    var $chart_canvas = $('<canvas id="myChart" width="570" height="300"></canvas>');
    $chart_container.append($chart_canvas);
    
    var myChart = new Chart($chart_canvas, {
        type: 'line',
        data: {
            labels: chart_labels,
            datasets: [{
                data: make_chart_data(user_transactions),  // this doesn't actually work yet
                backgroundColor: chart_background_color,
                borderColor: chart_border_color,
                borderWidth: 1
            }]
        },
        options: chart_options
    });


    // animate in right panel again
    $right_panel.css('top', '-1000px');
    $right_panel.animate({"top": "0px"}, "1.3s");
};