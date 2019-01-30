// This function helps to insert action plan objective, intervention and action types from a CSV file.
// It takes CSV files fril input/.
// Those CSV files are created from the Excel Action Plan file with first rows removed.
// This script inserts rows by rows, first column in case_objective_type, second column in case_interventiuon_type and third column in case_action_type.
// It tries to insert every time but it is rejected when their is conflict because the description is the same
// Before inserting column 2 it takes the id from column 1 with a select (same process for column 3)

var pg = require('pg');
const csv = require("csvtojson");

var files = ['1.csv', 'access.csv', 'caregiver.csv', 'economic.csv', 'function.csv', 'health.csv', 'mh.csv']

async function main() {
    try {
        var conString = "postgres://syldor@localhost:5432/worldeduc";

        var client = new pg.Client(conString);
        await client.connect();

        for(var p = 0; p < files.length ; p++) {
          var rows = await csv({noheader:true}).fromFile('input/' + files[p]);
          await insertRows(client, rows)
          console.log(`file ${files[p]} inserted`)
        }

        await client.end();

    } catch(err) {
        console.log(err);
    }

}

async function insertRows(client, rows) {
    for(var i = 0; i < rows.length; i++) {

        try {
            await client.query("Insert into case_objective_type(description_en) values ($1) on conflict do nothing;", [rows[i]['field1']]);
        }
        catch(err) {
            console.log(err);
        }
        var res = await client.query("select id from case_objective_type where description_en = $1;", [rows[i]['field1']])


        var objectiveId = res.rows[0].id

        try {
            await client.query("Insert into case_intervention_type(description_en, case_objective_type_id) values ($1, $2) on conflict do nothing;", [rows[i]['field2'], objectiveId]);
        }
        catch(err) {
            console.log(err);
        }
        var res = await client.query("select id from case_intervention_type where description_en = $1;", [rows[i]['field2']])

        var interventionId = res.rows[0].id

        try {
            await client.query("Insert into case_action_type(description_en, case_intervention_type_id) values ($1, $2) on conflict do nothing;", [rows[i]['field3'], interventionId]);
        }
        catch(err) {
            console.log(err);
        }
    }
}

main()
