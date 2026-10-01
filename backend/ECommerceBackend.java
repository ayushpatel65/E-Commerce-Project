import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;


class OrderItem {

    String productName;
    int quantity;
    double amount;

    OrderItem(String productName, int quantity, double amount) {

        this.productName = productName;
        this.quantity = quantity;
        this.amount = amount;
    }
}


class Order {

    String orderId;
    String customerName;
    String customerEmail;
    String customerAddress;

    ArrayList<OrderItem> items;

    double total;

    Order(
        String orderId,
        String customerName,
        String customerEmail,
        String customerAddress
    ) {

        this.orderId = orderId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerAddress = customerAddress;

        items = new ArrayList<>();

        total = 0;
    }


    void addItem(String name, int quantity, double amount) {

        OrderItem item =
            new OrderItem(name, quantity, amount);

        items.add(item);

        total += amount;
    }


    void displayOrder() {

        System.out.println();
        System.out.println("==================================================");
        System.out.println("                 E-COMMERCE ORDER");
        System.out.println("==================================================");

        System.out.println();

        System.out.println("Customer Details");
        System.out.println("--------------------------------------------------");

        System.out.println("Name       : " + customerName);
        System.out.println("Email      : " + customerEmail);
        System.out.println("Address    : " + customerAddress);

        System.out.println();
        System.out.println("Order ID   : " + orderId);

        System.out.println();
        System.out.println("--------------------------------------------------");
        System.out.printf(
            "%-25s %-8s %-10s%n",
            "Product",
            "Qty",
            "Amount"
        );

        System.out.println("--------------------------------------------------");

        for (OrderItem item : items) {

            System.out.printf(
                "%-25s %-8d ₹%-10.2f%n",
                item.productName,
                item.quantity,
                item.amount
            );
        }

        System.out.println("--------------------------------------------------");

        System.out.printf(
            "%-34s ₹%.2f%n",
            "TOTAL",
            total
        );

        System.out.println("==================================================");
        System.out.println("              ORDER PROCESSED");
        System.out.println("==================================================");
        System.out.println();
    }
}


public class ECommerceBackend {

    public static void main(String[] args) throws Exception {

        HttpServer server = HttpServer.create(
            new InetSocketAddress(8080),
            0
        );


        server.createContext("/order", exchange -> {

            exchange.getResponseHeaders().set(
                "Access-Control-Allow-Origin",
                "*"
            );

            exchange.getResponseHeaders().set(
                "Access-Control-Allow-Headers",
                "Content-Type"
            );

            exchange.getResponseHeaders().set(
                "Access-Control-Allow-Methods",
                "POST, OPTIONS"
            );


            if (exchange.getRequestMethod().equals("OPTIONS")) {

                exchange.sendResponseHeaders(204, -1);

                return;
            }


            if (!exchange.getRequestMethod().equals("POST")) {

                exchange.sendResponseHeaders(405, -1);

                exchange.close();

                return;
            }


            String data = new String(
                exchange.getRequestBody().readAllBytes(),
                StandardCharsets.UTF_8
            );


            String[] parts = data.split("\\|", -1);


            if (parts.length >= 6) {

                String orderId = parts[0];

                String name = parts[1];

                String email = parts[2];

                String address = parts[3];

                String itemsData = parts[4];

                Order order = new Order(
                    orderId,
                    name,
                    email,
                    address
                );


                String[] items = itemsData.split(";");


                for (String item : items) {

                    String[] itemData = item.split("~");

                    if (itemData.length == 3) {

                        String productName = itemData[0];

                        int quantity =
                            Integer.parseInt(itemData[1]);

                        double amount =
                            Double.parseDouble(itemData[2]);


                        order.addItem(
                            productName,
                            quantity,
                            amount
                        );
                    }
                }


                order.displayOrder();
            }


            String response =
                "{\"message\":\"Order received by Java backend!\"}";


            exchange.getResponseHeaders().set(
                "Content-Type",
                "application/json"
            );


            byte[] responseData =
                response.getBytes(StandardCharsets.UTF_8);


            exchange.sendResponseHeaders(
                200,
                responseData.length
            );


            try (OutputStream output =
                exchange.getResponseBody()) {

                output.write(responseData);
            }

        });


        server.start();


        System.out.println();
        System.out.println("==========================================");
        System.out.println("       JAVA E-COMMERCE BACKEND");
        System.out.println("==========================================");
        System.out.println(
            "Server running at http://localhost:8080"
        );
        System.out.println();
    }
}