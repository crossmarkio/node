import codec from 'ripple-address-codec'


export function init(){
	this.exec(
		`CREATE TABLE IF NOT EXISTS "Accounts" (
			"id"		INTEGER NOT NULL UNIQUE,
			"address"	BLOB NOT NULL UNIQUE,
			"domain"	TEXT,
			"emailHash"	TEXT,
			PRIMARY KEY ("id" AUTOINCREMENT)
		);

		CREATE UNIQUE INDEX IF NOT EXISTS 
		"AccountsAddress" ON "Accounts" 
		("address");`
	)
}

export function id(address, create=true){
	if(typeof address === 'number')
		return address

	return this.accounts.get({address})?.id 
		|| (create ? this.accounts.insert({address}).id : null)
}

export function get({id, address}){
	let row

	if(id){
		row = this.get(
			`SELECT * FROM Accounts
			WHERE id = ?`,
			id
		)
	}else if(address){
		row = this.get(
			`SELECT * FROM Accounts
			WHERE address = ?`,
			typeof address === 'string'
				? codec.decodeAccountID(address)
				: address
		)
	}

	if(!row)
		return null

	return {
		...row,
		address: codec.encodeAccountID(row.address)
	}
}

export function all(){
	return this.all(
		`SELECT * FROM Accounts`
	)
}

export function insert({address, domain, emailHash}){
	return this.insert({
		table: 'Accounts',
		data: {
			address: typeof address === 'string'
				? codec.decodeAccountID(address)
				: address,
			domain,
			emailHash
		},
		duplicate: 'update',
		returnRow: true
	})
}

export function count(){
	return this.getv(`SELECT COUNT(1) FROM Accounts`)
}