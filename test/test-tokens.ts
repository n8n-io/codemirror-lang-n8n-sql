import ist from "ist"
import {PostgreSQL, MySQL, SQLDialect} from "codemirror-lang-n8n-sql"

const mysqlTokens = MySQL.language
const postgresqlTokens = PostgreSQL.language
const bigQueryTokens = SQLDialect.define({
  treatBitsAsBytes: true
}).language

describe("Parse MySQL tokens", () => {
  const parser = mysqlTokens.parser

  it("parses quoted bit-value literals", () => {
    console.log(parser.parse("SELECT b'0101' \n\t FROM my_table").toString());
    
    ist(parser.parse("SELECT b'0101'"), 'Script(Statement(Keyword,String,Bits))')
  })

  it("parses unquoted bit-value literals", () => {
    ist(parser.parse("SELECT 0b01"), 'Script(Statement(Keyword,String,Bits))')
  })
})

describe("Parse PostgreSQL tokens", () => {
  const parser = postgresqlTokens.parser

  it("parses quoted bit-value literals", () => {
    ist(parser.parse("SELECT b'0101'"), 'Script(Statement(Keyword,String,Bits))')
  })

  it("parses quoted bit-value literals", () => {
    ist(parser.parse("SELECT B'0101'"), 'Script(Statement(Keyword,String,Bits))')
  })

  it("parses double dollar quoted string literals", () => {
    ist(parser.parse("SELECT $$hello$$"), 'Script(Statement(Keyword,String,String))')
  })
})

describe("Parse BigQuery tokens", () => {
  const parser = bigQueryTokens.parser

  it("parses quoted bytes literals in single quotes", () => {
    ist(parser.parse("SELECT b'abcd'"), 'Script(Statement(Keyword,String,Bytes))')
  })

  it("parses quoted bytes literals in double quotes", () => {
    ist(parser.parse('SELECT b"abcd"'), 'Script(Statement(Keyword,String,Bytes))')
  })

  it("parses bytes literals in single quotes", () => {
    ist(parser.parse("SELECT b'0101'"), 'Script(Statement(Keyword,String,Bytes))')
  })

  it("parses bytes literals in double quotes", () => {
    ist(parser.parse('SELECT b"0101"'), 'Script(Statement(Keyword,String,Bytes))')
  })
})

describe("Parse n8n resolvables", () => {
  const parser = postgresqlTokens.parser

  it("parses 4-node SELECT variants", () => {
    ist(parser.parse("{{ 'SELECT' }} my_column FROM my_table"), 'Script(Statement(Resolvable,String,Identifier,String,Keyword,String,Identifier))')
    
    ist(parser.parse("SELECT {{ 'my_column' }} FROM my_table"), 'Script(Statement(Keyword,String,Resolvable,String,Keyword,String,Identifier))')

    ist(parser.parse("SELECT my_column {{ 'FROM' }} my_table"), 'Script(Statement(Keyword,String,Identifier,String,Resolvable,String,Identifier))')

    ist(parser.parse("SELECT my_column FROM {{ 'my_table' }}"), 'Script(Statement(Keyword,String,Identifier,String,Keyword,String,Resolvable))')
  })

  it("parses 5-node SELECT variants (with semicolon)", () => {
    ist(parser.parse("{{ 'SELECT' }} my_column FROM my_table;"), 'Script(Statement(Resolvable,String,Identifier,String,Keyword,String,Identifier,";"))')
    
    ist(parser.parse("SELECT {{ 'my_column' }} FROM my_table;"), 'Script(Statement(Keyword,String,Resolvable,String,Keyword,String,Identifier,";"))')

    ist(parser.parse("SELECT my_column {{ 'FROM' }} my_table;"), 'Script(Statement(Keyword,String,Identifier,String,Resolvable,String,Identifier,";"))')

    ist(parser.parse("SELECT my_column FROM {{ 'my_table' }};"), 'Script(Statement(Keyword,String,Identifier,String,Keyword,String,Resolvable,";"))')
  })
})
