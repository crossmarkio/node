import { extractExchanges } from '@xrplkit/txmeta'


export function extractTokenExchanges({ ctx, ledger }){
	let exchanges = []

	for(let transaction of ledger.transactions){
		exchanges.push(...extractExchanges(transaction))
	}

	if(exchanges.length === 0)
		return

	for(let { hash, sequence, maker, taker, takerPaid, takerGot } of exchanges){
		let takerPaidToken = {
			currency: takerPaid.currency,
			issuer: takerPaid.issuer
				? { address: takerPaid.issuer }
				: undefined
		}

		let takerGotToken = {
			currency: takerGot.currency,
			issuer: takerGot.issuer
				? { address: takerGot.issuer }
				: undefined
		}

		
		for(let token of [takerPaidToken, takerGotToken]){
			if(token.issuer)
				ctx.affectedScope({
					token,
					change: 'exchanges'
				})
		}

		ctx.db.tokenExchanges.createOne({
			data: {
				txHash: hash,
				ledgerSequence: ledger.sequence,
				taker: {
					address: taker
				},
				maker: {
					address: maker
				},
				sequence,
				takerPaidToken,
				takerGotToken,
				takerPaidValue: takerPaid.value,
				takerGotValue: takerGot.value,
			}
		})
	}
}