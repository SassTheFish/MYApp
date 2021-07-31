

let num = 100001001010101001100101013;
let loops = 0;
while(num !== 1){
    console.log(num)
    loops++;
    if(num % 2 == 0){
        num = num/2;
        continue;
    }
    if(num % 2 != 0){
        num = num * 3 + 1;
        continue;
    }
}

console.log(1);
console.log("Loops: ", loops);