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

// sort rows 

function sort_user_table() {
    $.each($(this).parent().children(), function(index, value) {
        $(value).removeClass('sorting');
    });
    $(this).addClass('sorting');
    var sort_field = $(this).attr('data-sort');
    users = users.sort(function(a, b) {
        return a[sort_field] > b[sort_field];
    });
    $user_list.empty();
    populate_user_table(users);
};

function sort_transaction_table() {
    $.each($(this).parent().children(), function(index, value) {
        $(value).removeClass('sorting');
    });
    $(this).addClass('sorting');

};

var left_panel_headers = $('#left-panel').find('.headers').children();
$.each(left_panel_headers, function(index, value) {
    $(value).click(sort_user_table);
});

var right_panel_headers = $('#right-panel').find('.headers').children();
$.each(right_panel_headers, function(index, value) {
    $(value).click(sort_transaction_table);
});

// chart configurations

function parse_transactions(transactions, user) {
    var transactions_list = [];
    for (var i = 0; i < transactions.inboundInfo.length; i++) {
        var transaction_item = {
            inbound: transactions.inboundInfo[i].who_from,
            outbound: user.phone,
            amount: transactions.user
        };
        transactions_list.push(transaction_item);
    }
    for (var i = 0; i < transactions.outboundInfo.length; i++) {
        var transaction_item = {
            outbound: transactions.outboundInfo[i].who_to,
            inbound: user.phone,
            amount: transactions.user
        };
        transactions_list.push(transaction_item);
    }

    return transactions_list;
}

function get_user_transactions(user) {
    $.ajax({
        url: 'https://dry-brushlands-97078.herokuapp.com/db',
        type: 'post',
        data: user.phone,
        headers: {
            "Content-Type": "application/json"
        },
        dataType: 'json',
        success: function (data) {
            transactions = data;
            console.log("transactions line 82" + transactions);
            populate_transactions_table(parse_transactions(transactions, user));
        }
    });

}



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
    },
    title: {
        display: true,
        text: 'Insights'
    },
    scales: {
        yAxes: [{
            display: true,
            ticks: {
                suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
            }
        }]

    }
};

var chart_labels = ["Income", "Spending"];
var chart_background_color = 'rgba(109,176,45,0.2)';
var chart_border_color = '#6DB02D';

function make_chart_data(transactions) {
    // this doesn't actually work yet, here is some fake data
    return [15, 13];
}
    

// fills out user table

function populate_user_table(users) {
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

}    

// fills out transaction table

function populate_transactions_table(user_transactions) {
    console.log(user_transactions);
    $.each(user_transactions , function(index, value) {
        var transaction_div = $('<div></div>')
            .addClass('transaction-row');
        var inbound = $('<div></div>')
            .addClass('col-inbound')
            .text(value.inbound);  
        var outbound = $('<div></div>')
            .addClass('col-outbound')
            .text(value.outbound);  
        var datetime = $('<div></div>')
            .addClass('col-datetime')
            .text("06-11-2016 4:02pm");
        var amount = $('<div></div>')
            .addClass('col-amount')
            .text("$" + value.amount + ".00");
        transaction_div.append(inbound)
                       .append(outbound)
                       .append(datetime)
                       .append(amount);
        
        $transaction_list.append(transaction_div);
    });
}


// fetch mock data

$.getJSON(url, function(response) {
    users = response.users;
    // transactions = response.transactions;
    populate_user_table(users);
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
    // $right_panel.css('top', '-1000px');
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
    var user_transactions = get_user_transactions(current_user);
    // var user_transactions = find_transactions(transactions, id);

    // fill out transaction list

    // $.each(user_transactions , function(index, value) {
    //     var transaction_div = $('<div></div>')
    //         .addClass('transaction-row')
    //         .attr("data-id", value.id);
    //     var sender = $('<div></div>')
    //         .addClass('col-sender')
    //         .text(find_user(users, value.sender).phone);  // this is probably REALLY inefficient, sorry.......
    //     var recipient = $('<div></div>')
    //         .addClass('col-recipient')
    //         .text(find_user(users, value.recipient).phone);  // this is probably REALLY inefficient, sorry.......
    //     var datetime = $('<div></div>')
    //         .addClass('col-datetime')
    //         .text(value.datetime);
    //     var amount = $('<div></div>')
    //         .addClass('col-amount')
    //         .text(value.amount);
    //     transaction_div.append(sender)
    //                    .append(recipient)
    //                    .append(datetime)
    //                    .append(amount);
    //     $transaction_list.append(transaction_div);
    // });

    // reset and make chart
    
    $chart_container.empty();
    var $chart_canvas = $('<canvas id="myChart" width="570" height="200"></canvas>');
    $chart_container.append($chart_canvas);
    
    var myChart = new Chart($chart_canvas, {
        type: 'bar',
        data: {
            labels: chart_labels,
            datasets: [{
                data: [8, 11],  // this doesn't actually work yet
                backgroundColor: ["rgba(109,176,45,0.6)", "rgba(245,166,35, 0.6)"],
                borderColor: ["rgba(109,176,45,1)", "rgba(245,166,35, 1)"],
                borderWidth: 1
            }]
        },
        options: chart_options

        // #F5A623
    });
    $right_panel.css("top", "-1000px");
    $right_panel.animate({"top": "0px"}, "1.3s");
};