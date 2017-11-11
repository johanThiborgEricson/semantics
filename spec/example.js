describe("The Semantics! library", function() {
  
  it("can implement operator precedence", function() {
    var f = new InterpreterMethodFactory();
    var interpreter = {
      digit:   f.terminal(/0|1|2|3|4|5|6|7|8|9/, 
                function(digits) {
                  return Number(digits);
                }),
      product:  f.longest("digit", "product1"), 
      product1: f.group("product", /\*/, "digit", 
                function(product,         digit) {
                  return product     *    digit;
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