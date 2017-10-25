describe("The Semantics! library", function() {
  
  it("can implement operator precedence", function() {
    var f = new InterpreterMethodFactory();
    var interpreter = {
      number:   f.terminal(/[0-9]+/, 
                function(digits) {
                  return Number(digits);
                }),
      product:  f.longest("number", "product1"), 
      product1: f.group("product", /\*/, "number", 
                function(product,         number) {
                  return product     *    number;
                }),
      sum:      f.longest("product", "sum1", "sum2"), 
      sum1:     f.group("sum", /\+/, "product", 
                function(sum,         product) {
                  return sum     +    product;
                }),
      sum2:     f.group("sum", /-/, "product", 
                function(sum,        product) {
                  return sum    -    product;
                }),
    };  
    
    // result == 2
    var result = interpreter.sum("3*5-2*7+1");
    expect(result).toBe(2);
  });
  
});