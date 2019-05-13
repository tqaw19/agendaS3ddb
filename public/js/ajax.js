$(document).ready(function(){

    // if($('.not-active-compra').hasClass('active')){
    //     if($('input[name=tipoPago]:checked').length == 0){
    //       return
    //     }else{
    //       $('#btnComprar').click(function () { 
    //         duranteCompra()
    //       })
    //     }
    //   }

    $("form").submit(function(e){
        e.preventDefault();
        precioJava = 1200
        precioPHP = 800
        precioNet = 1500

        var total
        var modulos = $('input[name=modulo]:checked').map(function () { 
            return $(this).val()
         }).get()

        var tipoPago = $('input[name=tipoPago]:checked').val()
        var tmñModulo = $('input[name=modulo]:checked').length
        var curso = $('input[name=txtCurso]').val()


        if(tipoPago == "efectivo"){
            if(curso.toLowerCase() == "java"){
                // total = (precioJava * tmñModulo)*(0.10*tmñModulo)
                // console.log(precioJava*tmñModulo+" | "+0.10*tmñModulo);
                descuento = (precioJava*tmñModulo)*0.10
                total = (precioJava*tmñModulo)-descuento

            }else if (curso.toLowerCase() == "php"){
                descuento = (precioPHP*tmñModulo)*0.10
                total = precioPHP * tmñModulo
            }else{
                descuento = (precioNet*tmñModulo)*0.10
                total = precioNet * tmñModulo
            }
        }else {
            if(curso.toLowerCase() == "java"){
                total = precioJava * tmñModulo
                console.log("tarj: "+total);
            }else if (curso.toLowerCase() == "php"){
                total = precioPHP * tmñModulo
            }else{
                total = precioNet * tmñModulo
            }
        }
        

        var curso = {
            nombre: curso,
            modulos: modulos,
            tipoPago : tipoPago,
            precioTotal : total
        }

        $.ajax({
            method: 'POST',
            url: '/compra',
            data: JSON.stringify({curso : curso}) ,
            contentType: 'application/json',
            beforeSend: function () { 
                $('#btnCompra').val("Procesando")
             },
            success: function (req) { 
   
                m = "";
                for(i in req.curso.modulos){
                    m += req.curso.modulos[i] + " "    
                }
                
                $("#resNomCurso").html(req.curso.nombre)
                $('#resTipoPago').html(req.curso.tipoPago)
                $('#resPagoTotal').html(req.curso.precioTotal)
                $("#resModulos").html(m)
                
                
             }, 
             error : function (err) {  
                console.log(err.responseJSON.data);
             }
        })
        // .done(function(data){
        //     // $('h2').html(data.quote);
        //     $('h2').html("PHP");
        //     console.log("prueba"+data.precio);
        // });

    });
});