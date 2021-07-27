let array = [1,4,5,6,3,2,7,98,4,5];



let biggest;
let temp;
for(let i = 0; i < array.length; i++)
{
    biggest = i;
    for(let j = i + 1; j < array.length;j++){
        if(array[biggest] < array[j]){
            biggest = j;
        }
    }
    temp = array[i];
    array[i] = array[biggest];
    array[biggest] = temp;
}
console.log(array);