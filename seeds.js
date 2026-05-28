//Mongoose start
const mongoose = require ('mongoose');
const { ObjectId } = mongoose.Types; // This defines the ObjectId function for your script

//connection with mongoose
//

const Product = require('./models/product.js');

require('dotenv').config();

const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/AAAStore';


//to be changed if ported to another machine!
const ownerId = '69de9c8e1c3b3ab9003e14b7';

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Seeding connection open to:", mongoose.connection.host);
        seedDB();
    })
    .catch(err => {
        console.log("Seeding connection error:", err);
    });

const seedProducts = [
    {
    _id: '69af636797c007ffac0ea54e',
    name: 'gigabit er7212pc',
    brand: 'TP-LINK',
    price: 194.06,
    category: 'router',
    quantity: 97,
    details: 'TP-Link 8 PortGigabit VPN Router, 3-in-1 Ethernet Network Switch, Ethernet Splitter, Desktop & Wall-Mounting, Plug-and-Play, Fanless, Cloud access easy management (ER7212PC)',
    image: '/pictures/GB-ER7212PC.jpg',
    owner: ownerId,
    __v: 0,
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776173932/AAAStore/ahbfduzhyj9bcxskwqo2.jpg',
        filename: 'AAAStore/ahbfduzhyj9bcxskwqo2',
        _id: '69de436dee8fe0ae808b5758'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776173932/AAAStore/ma8js4kj7jpyziuwocri.jpg',
        filename: 'AAAStore/ma8js4kj7jpyziuwocri',
        _id: '69de436dee8fe0ae808b5759'
      }
    ]
  },
  {
    _id: '69af636797c007ffac0ea54f',
    name: 'gmktec mini pc - ai ready',
    brand: 'GMKTEC',
    price: 1099.96,
    category: 'workstation',
    quantity: 11,
    details: 'GMKtec AI Mini PC AMD Ryzen AI 9 HX-370 Serie(5.1GHz) Mini Computers, 32GB LPDDR5X 1TB PCIe 4.0 SSD, Support W-11 Pro, Triple Screen 8K Display, WiFi 6 & USB4/Oculink Interface/EVO-X1 ',
    image: '/pictures/GMKTec-mini.jpeg',
    owner: ownerId,
    __v: 0,
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174310/AAAStore/er2soxrxys2f5gtnhnn8.jpg',
        filename: 'AAAStore/er2soxrxys2f5gtnhnn8',
        _id: '69de44e7ee8fe0ae808b57dc'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174310/AAAStore/wprqfm0syjmrq1nd2vzg.jpg',
        filename: 'AAAStore/wprqfm0syjmrq1nd2vzg',
        _id: '69de44e7ee8fe0ae808b57dd'
      }
    ]
  },
  {
    _id: '69af636797c007ffac0ea550',
    name: 'fast optiplex i7-6700',
    brand: 'DELL',
    price: 286.99,
    category: 'server',
    quantity: 4,
    details: 'SFF Desktop Computer PC - Intel Core i7 6th Gen (4-cores up to 4.00GHz), 32GB RAM, 1TB SSD Storage, HDMI 300Mbps USB WiFi Windows 11 Pro OS (Renewed) ',
    image: '/pictures/optiplex.jpg',
    owner: ownerId,
    __v: 0,
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174370/AAAStore/ebnp4gunjteyrkuauk4k.jpg',
        filename: 'AAAStore/ebnp4gunjteyrkuauk4k',
        _id: '69de4523ee8fe0ae808b58ce'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174370/AAAStore/honw4rl7eq7gzrlpeh7l.jpg',
        filename: 'AAAStore/honw4rl7eq7gzrlpeh7l',
        _id: '69de4523ee8fe0ae808b58cf'
      }
    ]
  },
  {
    _id: '69af636797c007ffac0ea551',
    name: 'rv180w-e-k9-g5 ',
    brand: 'CISCO',
    price: 197.01,
    category: 'router',
    quantity: 6,
    details: '  Affordable,high-performance Gigabit Ethernet ports enable large files and multiple users -  Versatile device can function either as a wireless router,wireless bridge,or wireless repeater\r\n' +
      ' Wireless-N access point provides highly secure untethered connectivity\r\n' +
      '    IP Security (IPsec) site-to-site VPN helps enables secure connectivity for remote employees and multiple offices\r\n' +
      '    Built-in secure policy index (SPI) firewall,robust authentication,and access control safeguard sensitive business data',
    image: '/pictures/cudy1200.jpg',
    owner: ownerId,
    __v: 0,
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174412/AAAStore/ksxgekleniaew7i6zwod.jpg',
        filename: 'AAAStore/ksxgekleniaew7i6zwod',
        _id: '69de454cee8fe0ae808b5a2e'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174412/AAAStore/jjuakbb22ismuufepok2.jpg',
        filename: 'AAAStore/jjuakbb22ismuufepok2',
        _id: '69de454cee8fe0ae808b5a2f'
      }
    ]
  },
  {
    _id: '69af636797c007ffac0ea552',
    name: 'c1300-48p-4x catalyst',
    brand: 'CISCO',
    price: 995.28,
    category: 'switch',
    quantity: 5,
    details: 'Layer 3 managed switch\r\n' +
      '(48) 1GbE PoE+ ports\r\n' +
      '(4) 10G SFP+ uplinks\r\n' +
      '375W PoE budget\r\n' +
      'True Stacking capability\r\n' +
      'Limited lifetime warranty',
    image: '/pictures/s-l1600.jpg',
    owner: ownerId,
    __v: 0,
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174452/AAAStore/ugla3udjmlkytvarntwd.png',
        filename: 'AAAStore/ugla3udjmlkytvarntwd',
        _id: '69de4575ee8fe0ae808b5af1'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174452/AAAStore/l8h4yglyauawb3cgjdet.png',
        filename: 'AAAStore/l8h4yglyauawb3cgjdet',
        _id: '69de4575ee8fe0ae808b5af2'
      }
    ]
  },
  {
    _id: '69af636797c007ffac0ea553',
    name: 'zx spectrum 48k',
    brand: 'SINCLAIR',
    price: 120,
    category: 'workstation',
    quantity: 3,
    details: 'The ZX Spectrum (UK: /zɛd ɛks/) is an 8-bit home computer developed and marketed by Sinclair Research. The Spectrum played a pivotal role in the history of personal computers and video games, especially in the United Kingdom. It was one of the all-time bestselling British computers with over five million units sold. It was first released in Britain on 23 April 1982 with releases in some other regions, including West Germany and the United States, after that year. ',
    image: '/pictures/spectrum.jpg',
    owner: ownerId,
    
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174488/AAAStore/jbbgqw2w4zfkxammsffs.jpg',
        filename: 'AAAStore/jbbgqw2w4zfkxammsffs',
        _id: '69de4598ee8fe0ae808b5be0'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174488/AAAStore/ldymgwmjzpds5kmunwwy.jpg',
        filename: 'AAAStore/ldymgwmjzpds5kmunwwy',
        _id: '69de4598ee8fe0ae808b5be1'
      }
    ]
  },
  {
    _id: '69af636797c007ffac0ea554',
    name: '2u rackmount r280-f2o barebone dual',
    brand: 'GIGABYTE',
    price: 359.99,
    category: 'server',
    quantity: 5,
    details: " Barebone server does not include CPU's, memory, hard drives or operating system. These items are available seperately.\r\n" +
      '\r\n' +
      'Intel Xeon E5-1600/2600 v3 - Processor Families\r\n' +
      'Based on the haswell microarchitecture, these new intel processor families bring a whole new set of performance boosting features. In addition to the usual boost in frequencies and core numbers, the intel xeon e5-1600/2600 v3 families are the first in the industry to support the brand new ddr4 memory technology.',
    image: '/pictures/server-2534216-xl-a.webp',
    owner: ownerId,
    __v: 0,
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174513/AAAStore/a7dyu19ot11lmqi6ja0a.webp',
        filename: 'AAAStore/a7dyu19ot11lmqi6ja0a',
        _id: '69de45b2ee8fe0ae808b5c7b'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174513/AAAStore/au9qhy7vwpaxwzzj6bx2.webp',
        filename: 'AAAStore/au9qhy7vwpaxwzzj6bx2',
        _id: '69de45b2ee8fe0ae808b5c7c'
      }
    ]
  },
  {
    _id: '69af636797c007ffac0ea555',
    name: 'ethernet cable cat 8 1.5m',
    brand: 'DIGOLOAN',
    price: 6.49,
    category: 'cable',
    quantity: 74,
    details: 'High Speed Ethernet: Cat 8 ethernet cable provides bandwidth up to 2000MHz, boosts the speed of data transmission up to 40Gbps. The high speed rates of ethernet cable offers fast video loading, game progression and more',
    image: '/pictures/ethcab1.jpg',
    owner: ownerId,
    __v: 0,
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174550/AAAStore/rjhqafnvtyzxgrixjoo3.jpg',
        filename: 'AAAStore/rjhqafnvtyzxgrixjoo3',
        _id: '69de45d7ee8fe0ae808b5d3e'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174551/AAAStore/lxqo7kv4nf63dqy7viyi.jpg',
        filename: 'AAAStore/lxqo7kv4nf63dqy7viyi',
        _id: '69de45d7ee8fe0ae808b5d3f'
      }
    ]
  },
  {
    _id: '69af636797c007ffac0ea556',
    name: 'ethernet cable cat 8 5m',
    brand: 'ATEK',
    price: 8.79,
    category: 'cable',
    quantity: 100,
    details: 'Cat8 Ethernet Cable (5M), 40 Gbps 2000 MHz, High-Speed Braided RJ45 LAN Cable. Compatible with PC, Laptop, Cat5/5e/6/Cat7 Xbox, Tablets, Storage Devices, Modem, Router, Switch, and TV (Black) ',
    image: '/pictures/ethcab1.jpg',
    owner: ownerId,
    __v: 0,
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776173341/UK-Amateur-Orchestras/sb0wo3ixjmh4suqvyaiv.jpg',
        filename: 'UK-Amateur-Orchestras/sb0wo3ixjmh4suqvyaiv',
        _id: '69de411d013196e9ddc78359'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776173340/UK-Amateur-Orchestras/kwrmk7vqcfbz1u1kxgjd.jpg',
        filename: 'UK-Amateur-Orchestras/kwrmk7vqcfbz1u1kxgjd',
        _id: '69de411d013196e9ddc7835a'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174568/AAAStore/oq3qthd4r96dlxsnqg5o.jpg',
        filename: 'AAAStore/oq3qthd4r96dlxsnqg5o',
        _id: '69de45e9ee8fe0ae808b5dae'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174568/AAAStore/nzvnogv1xxjmr08qy3o1.jpg',
        filename: 'AAAStore/nzvnogv1xxjmr08qy3o1',
        _id: '69de45e9ee8fe0ae808b5daf'
      }
    ]
  },
  {
    _id: '69af636797c007ffac0ea557',
    name: 'precision t3620 workstation',
    brand: 'DELL',
    price: 145,
    category: 'workstation',
    quantity: 10,
    details: 'The Dell Precision T3620 tower workstation delivers exceptional performance for professional applications, featuring Intel Xeon E3 V5 or 6th generation Intel Core processors and supporting up to 64GB of DDR4 memory. This versatile system efficiently manages demanding workflows including 3D rendering, CAD applications and data analysis within a practical tower design optimised for professional environments.',
    image: '/pictures/dell-precision-t3620-workstation.webp',
    owner: ownerId,
    __v: 0,
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174595/AAAStore/dcy9zzvw8gpvqtgmdadx.jpg',
        filename: 'AAAStore/dcy9zzvw8gpvqtgmdadx',
        _id: '69de4603ee8fe0ae808b5e24'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174595/AAAStore/defk7yw2pdjonihxjqpq.jpg',
        filename: 'AAAStore/defk7yw2pdjonihxjqpq',
        _id: '69de4603ee8fe0ae808b5e25'
      }
    ]
  },
  {
    _id: '69b731c601cbe3a95994a785',
    name: 'aginet ex820v',
    brand: 'TP-LINK',
    price: 99.99,
    category: 'router',
    quantity: 16,
    details: 'Warp-Speed Wi-Fi: Up to 6 Gbps dual band Wi-Fi enables faster browsing, streaming, and downloading—all at the same time.*\r\n' +
      'Multi-Gig Connections: Break through the 1 Gbps bottleneck with a 2.5G WAN port and 2.5G LAN port for faster internet access and wired connections.△ ‡\r\n' +
      'Superior Coverage: High-performance antennas and Beamforming technology combine to extend strong, reliable WiFi throughout your home.\r\n' +
      'More Connections: OFDMA and MU-MIMO technologies increase capacity and enable simultaneous transmission to more devices.**',
    image: '/pictures/xzt.jpg',
    __v: 0,
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174621/AAAStore/ay7vrqra1d6qetzdagyh.jpg',
        filename: 'AAAStore/ay7vrqra1d6qetzdagyh',
        _id: '69de461eee8fe0ae808b5ec4'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174621/AAAStore/qbld9gqmeofqwxhhn7wh.jpg',
        filename: 'AAAStore/qbld9gqmeofqwxhhn7wh',
        _id: '69de461eee8fe0ae808b5ec5'
      }
    ]
  },
  {
    _id: '69de38af37303183f570fa36',
    name: ' unifi u6+',
    brand: 'UBIQUITI',
    price: 99.99,
    category: 'access point',
    quantity: 20,
    details: 'wireless access point 2402 Mbit/s White Power over Ethernet (PoE)',
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174648/AAAStore/gjic0adpcx8jhab8t8hj.png',
        filename: 'AAAStore/gjic0adpcx8jhab8t8hj',
        _id: '69de4638ee8fe0ae808b5f61'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174647/AAAStore/ezshher72f19tjy0g1zw.jpg',
        filename: 'AAAStore/ezshher72f19tjy0g1zw',
        _id: '69de4638ee8fe0ae808b5f62'
      }
    ],
    __v: 0
  },
  {
    _id: '69de3a37472c0c097110a29a',
    name: 'vigorap 912c',
    brand: 'DRAYTEK',
    price: 96,
    category: 'access point',
    quantity: 35,
    details: 'Wireless Access Point 802.11ac, Range Extender, Mesh With Up To 8 x AP912C, Ceiling Or Wall Mounted, Ideal For Business, Power Over Ethernet ',
    images: [
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174694/AAAStore/qxcghjmm2dxd9bo9z9mr.jpg',
        filename: 'AAAStore/qxcghjmm2dxd9bo9z9mr',
        _id: '69de4667ee8fe0ae808b6014'
      },
      {
        url: 'http://res.cloudinary.com/dquv0bddb/image/upload/v1776174694/AAAStore/dqnokvuriamn5h8gwutj.jpg',
        filename: 'AAAStore/dqnokvuriamn5h8gwutj',
        _id: '69de4667ee8fe0ae808b6015'
      }
    ],
    __v: 0
  }


    


]





const seedDB = async () => {
    try {
        await Product.deleteMany({});
        console.log('Collection cleared');
        
        const products = await Product.insertMany(seedProducts);
        console.log(`${products.length} products seeded successfully!`);
    } catch (e) {
        console.log('Error during seeding:', e);
    } finally {
        mongoose.connection.close();
    }
};
