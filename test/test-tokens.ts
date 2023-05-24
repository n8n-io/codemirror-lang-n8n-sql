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
    ist(parser.parse("SELECT b'0101'"), 'Script(Statement(Keyword,Bits))')
  })

  it("parses unquoted bit-value literals", () => {
    ist(parser.parse("SELECT 0b01"), 'Script(Statement(Keyword,Bits))')
  })
})

describe("Parse PostgreSQL tokens", () => {
  const parser = postgresqlTokens.parser

  it("parses quoted bit-value literals", () => {
    ist(parser.parse("SELECT b'0101'"), 'Script(Statement(Keyword,Bits))')
  })

  it("parses quoted bit-value literals", () => {
    ist(parser.parse("SELECT B'0101'"), 'Script(Statement(Keyword,Bits))')
  })

  it("parses double dollar quoted string literals", () => {
    ist(parser.parse("SELECT $$hello$$"), 'Script(Statement(Keyword,String))')
  })
})

describe("Parse BigQuery tokens", () => {
  const parser = bigQueryTokens.parser

  it("parses quoted bytes literals in single quotes", () => {
    ist(parser.parse("SELECT b'abcd'"), 'Script(Statement(Keyword,Bytes))')
  })

  it("parses quoted bytes literals in double quotes", () => {
    ist(parser.parse('SELECT b"abcd"'), 'Script(Statement(Keyword,Bytes))')
  })

  it("parses bytes literals in single quotes", () => {
    ist(parser.parse("SELECT b'0101'"), 'Script(Statement(Keyword,Bytes))')
  })

  it("parses bytes literals in double quotes", () => {
    ist(parser.parse('SELECT b"0101"'), 'Script(Statement(Keyword,Bytes))')
  })
})

describe("Parse n8n resolvables", () => {
  const parser = postgresqlTokens.parser

  it("parses 4-node SELECT variants", () => {
    ist(parser.parse("{{ 'SELECT' }} my_column FROM my_table"), 'Script(Statement(Resolvable,Identifier,Keyword,Identifier))')
    
    ist(parser.parse("SELECT {{ 'my_column' }} FROM my_table"), 'Script(Statement(Keyword,Resolvable,Keyword,Identifier))')

    ist(parser.parse("SELECT my_column {{ 'FROM' }} my_table"), 'Script(Statement(Keyword,Identifier,Resolvable,Identifier))')

    ist(parser.parse("SELECT my_column FROM {{ 'my_table' }}"), 'Script(Statement(Keyword,Identifier,Keyword,Resolvable))')
  })

  it("parses 5-node SELECT variants (with semicolon)", () => {
    ist(parser.parse("{{ 'SELECT' }} my_column FROM my_table;"), 'Script(Statement(Resolvable,Identifier,Keyword,Identifier,";"))')
    
    ist(parser.parse("SELECT {{ 'my_column' }} FROM my_table;"), 'Script(Statement(Keyword,Resolvable,Keyword,Identifier,";"))')

    ist(parser.parse("SELECT my_column {{ 'FROM' }} my_table;"), 'Script(Statement(Keyword,Identifier,Resolvable,Identifier,";"))')

    ist(parser.parse("SELECT my_column FROM {{ 'my_table' }};"), 'Script(Statement(Keyword,Identifier,Keyword,Resolvable,";"))')
  })
})
