<?php
    function insertElementToArray($arr = array(), $element = null, $index = 0)
    {
        if ($element == null) {
            return $arr;
        }
        $arrLength = count($arr);
        $j = $arrLength - 1;
        while ($j >= $index) {
            $arr[$j+1] = $arr[$j];
            $j--;
        }
        $arr[$index] = $element;
        return $arr;
    }

    $change = false;
    $newName = $_GET["name"];
    $newScore = $_GET["score"];
    $file = file_get_contents('./score.txt', true);
    $array = explode(";", $file);
    unset($array[count($array)-1]);
    $pos = 0;
    $trouver = false;
    for($i=0; $i < count($array); $i++){
        if($i == 5){
            break;
        }
        $array[$i] = explode("-", $array[$i]);
        if($trouver == false && intval($array[$i][1]) < intval($newScore)){
            $trouver = true;
            $pos = $i;
            break;
        }
    }
    if($trouver == true){
        $array = insertElementToArray($array, [$newName, $newScore], $pos);
        $change = true;
    }else{
        if(count($array) < 10){
            $array = insertElementToArray($array, [$newName, $newScore], count($array));
            $change = true;
        }
    }
    $res = "";
    if($change){
        for($i=0; $i < count($array); $i++){
            if($i == 5){
                break;
            }
            $res = $res. $array[$i][0]."-".$array[$i][1].";";
        }
        file_put_contents('score.txt', $res);
    }
    
    
?>