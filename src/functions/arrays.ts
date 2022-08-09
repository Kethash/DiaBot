export default function getPairs(e: Array<any>): Array<Array<any>> {
    var temp = []
    var result = []
  for (var i = 1; i <= e.length; i++) {
        if (i % 2 == 0) {
            temp.push(e[i-1]); 
      result.push(temp);
            temp = []
    } else {
      temp.push(e[i-1]); 
    }
  }
    return result;
}