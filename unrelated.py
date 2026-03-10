# Version with print statements to SEE what's happening
data = [8,5,7,4,1,2,6,3,9]
n = len(data)
pass_number = 1

for i in range(0, n):
    print(f"\n--- Pass {pass_number} ---")
    pass_number += 1
    
    for j in range(0, n-1):
        if data[j] > data[j+1]:
            print(f"  Swapping {data[j]} and {data[j+1]}")
            temp = data[j]
            data[j] = data[j+1]
            data[j+1] = temp
            print(f"  List now: {data}")
        else:
            print(f"  {data[j]} <= {data[j+1]}, no swap")
    
    print(f"After pass: {data}")

print(f"\nFinal sorted: {data}")