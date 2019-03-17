
const {tokenSnapshotSchema} = require('../schemas')

const MongoLong = require('mongodb').Long;
const connectMongo = require('../connections/mongo')

const {loadConfig} = require('../functions')


async function tokenSnapshot(fastify, request) {
    // console.log(request)
    return new Promise(async (resolve, reject) => {
        const config = loadConfig()
        const mongo = await connectMongo(config)
        const db = mongo.db(config.mongo.dbName)
        const collection = db.collection('contract_rows')
        const contract = request.query.contract || 'eosdactokens'
        const symbol = request.query.contract || 'EOSDAC'
        const block_num = request.query.block_num || '999999999'
        const sort_col = request.query.sort || 'account'

        console.log(`Generating snapshot for ${symbol}@${contract} on block ${block_num}`)

        const col = db.collection('contract_rows')

        const match = {code:contract, table:'members', block_num:{$lte:MongoLong.fromString(block_num)}}

        const res = col.aggregate([
            {'$match':match},
            {'$sort':{block_num:1}},
            {'$group':{
                    _id:{code:"$code", table:"$table", primary_key:"$primary_key"},
                    block_num:{'$last':"$block_num"},
                    data:{'$last':"$data"},
                    table:{'$last':"$table"},
                    code:{'$last':"$code"},
                    present:{'$last':"$present"}
                }
            },
            {'$match': {present:1}}
        ], (err, results) => {

            if (err){
                reject(err)
                console.error(err)
                return
            }

            results.forEach((doc) => {
                // console.log(doc.data.sender)
                const member = doc.data.sender

                members[member] = {terms:doc.data.agreedtermsversion, balance:null, block_num:doc.block_num}
            }, (err) => {
                if (err){
                    console.error(err)
                }
            })

            const members = {}

            col.aggregate([
                {'$match':{code:contract, table:'accounts', block_num:{$lte:MongoLong.fromString(block_num)}}},
                {'$sort':{block_num:1}},
                {'$group':{
                        _id:{code:"$code", table:"$table", scope:"$scope"},
                        block_num:{'$last':"$block_num"},
                        data:{'$last':"$data"},
                        table:{'$last':"$table"},
                        code:{'$last':"$code"},
                        present:{'$last':"$present"}
                    }
                },
                {'$match': {present:1}}
            ], {allowDiskUse:true}, async (err, results) => {

                if (err){
                    reject(err)
                    console.error(err)
                    return
                }

                // console.log(await results.count())
                results.forEach((row) => {
                    // console.log(row)
                    if (typeof members[row._id.scope] != 'undefined'){
                        members[row._id.scope].balance = row.data.balance
                    }


                }, () => {
                    // console.log("members", members)

                    const output = []
                    for (let account in members){

                        // console.log(members[account].terms)
                        if (members[account].balance !== null){
                            let [bal, cur] = members[account].balance.split(' ')
                            if (parseFloat(bal) >= 1){
                                console.log(`${account},${bal} ${cur}`)
                                output.push({account, balance:bal + ' ' + cur, terms:members[account].terms})
                            }
                        }

                    }

                    let sorter
                    const balance_sorter = (a,b) => {
                        const [bala, syma] = a.balance.split(' ')
                        const [balb, symb] = b.balance.split(' ')
                        return (parseFloat(bala) > parseFloat(balb))?-1:1
                    }
                    const account_sorter = (a,b) => (a[sort_col]<b[sort_col])?-1:1
                    switch (sort_col){
                        case 'balance':
                            sorter = balance_sorter
                            break
                        case 'account':
                        default:
                            sorter = account_sorter
                            break
                    }

                    const sorted = output.sort(sorter)

                    resolve(sorted)
                })
            })

        })
    })
}


module.exports = function (fastify, opts, next) {
    fastify.get('/token_snapshot', {
        schema: tokenSnapshotSchema.GET
    }, async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', '*')
        reply.send(await tokenSnapshot(fastify, request));
    });
    next()
};
