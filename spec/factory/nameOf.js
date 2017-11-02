describe("The nameOf method", function() {
  var f;
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  it("returns the name of the given property", function() {
    var propertyValue = "property value";
    var o = {
      propertyName: propertyValue
    };
    
    expect(f.nameOf(o, propertyValue)).toBe("propertyName");
  });
  
});
