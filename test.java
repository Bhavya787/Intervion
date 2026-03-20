import java.util.*;

public class test {
    public static void main (String[] args) {
        List<List<Integer>> list = null;
        
        
        // This performs a "shallow copy"
        List<List<Integer>> list2 = new ArrayList<>();
        list2.addAll(list);
        
        System.out.println(list.toString());
    }   
}
