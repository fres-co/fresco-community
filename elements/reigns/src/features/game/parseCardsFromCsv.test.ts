import { parseCardsFromCsv } from "./parseCardsFromCsv";

const data = `card,id,bearer,conditions,cooldown,weight,override_yes,answer_yes,yes_stat1,yes_stat2,yes_stat3,yes_stat4,yes_custom,answer_no,no_stat1,no_stat2,no_stat3,no_stat4,no_custom
"!!!Data officer, we want to test a new product. Is it ok to ignore GDPR practices for now?",,entrepreneur,,120,10,,Yes but keep me in the loop,5,5,-10,0,,Absolutely not!,-5,-5,0,,
One of our clients is asking to get his data deleted,,customer-support,,120,1,,,10,-5,10,0,,,-10,0,-10,,
"Our database queries are getting slower, we should do something about our old data",,developer,,120,1,,Delete data from inactive users,0,0,10,0,,Extract the data and archive it,-5,0,-10,,
`;

describe("parseCardsFromCsv", () => {
  it("should parse cards from string", () => {
    const cards = parseCardsFromCsv(data);
    expect(cards).toHaveLength(3);
    expect(cards![2].card).toContain("Our database queries are getting slower");
  });
});
